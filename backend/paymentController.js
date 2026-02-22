const { StandardCheckoutClient, Env, CreateSdkOrderRequest } = require('pg-sdk-node');
const { Order } = require('./Order');
const { Cart } = require('./Cart');
const { Product } = require('./Product');
const { sendCustomerStatusEmail, sendAdminNotification } = require('./emailService');
require('dotenv').config();

// --- LOAD CREDENTIALS ---
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID; // Used for env detection
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const CLIENT_VERSION = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1');

// For Webhooks (Optional but recommended in docs)
const CALLBACK_USERNAME = process.env.PHONEPE_CALLBACK_USER || "";
const CALLBACK_PASSWORD = process.env.PHONEPE_CALLBACK_PASSWORD || "";

// --- ROBUST ENVIRONMENT DETECTION ---
// If MERCHANT_ID starts with 'M' (official production prefix) or NODE_ENV is production
const isProduction = (MERCHANT_ID && MERCHANT_ID.startsWith('M')) || process.env.NODE_ENV === 'production';
const ENV = isProduction ? Env.PRODUCTION : Env.SANDBOX;

console.log(`📡 PhonePe SDK Mode: ${isProduction ? 'PRODUCTION 🚀' : 'SANDBOX 🧪'}`);

// Initialize SDK Client (Verified Signature: clientId, clientSecret, clientVersion, env)
const client = StandardCheckoutClient.getInstance(CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, ENV);

// --- URL HELPERS ---
const cleanUrl = (url) => {
    if (!url) return "";
    let cleaned = url.trim();
    if (!cleaned.startsWith("http")) {
        cleaned = "https://" + cleaned;
    }
    return cleaned.replace(/\/$/, "");
};

const BACKEND_URL = cleanUrl(process.env.BACKEND_URL || "https://api.neelafashion.com");
const FRONTEND_URL = cleanUrl(process.env.FRONTEND_URL || "https://neelafashion.com");

/**
 * 1. PAYMENT INITIATE (Standard Checkout)
 */
const initiatePayment = async (req, res) => {
    try {
        const { orderId, amount, userId, mobileNumber } = req.body;
        console.log(`🚀 Initiating Official SDK Payment for Order: ${orderId}, Amount: ${amount}`);

        if (!CLIENT_ID || !CLIENT_SECRET) {
            console.error("❌ PHONEPE_CLIENT_ID or PHONEPE_CLIENT_SECRET missing in .env");
            return res.status(500).json({ success: false, message: "Server Error: Payment Credentials Missing" });
        }

        const redirectUrl = `${BACKEND_URL}/api/payment/status/${orderId}`;
        const amountInPaise = Math.round(Number(amount) * 100);

        // Use verified Builder methods: merchantOrderId, amount, redirectUrl
        const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
            .merchantOrderId(orderId)
            .amount(amountInPaise)
            .redirectUrl(redirectUrl)
            .message(`Payment for Order #${orderId}`) // Detail added from docs
            .expireAfter(3600) // 1 Hour expiry (from docs)
            .build();

        console.log("👉 Calling client.pay()...");
        const response = await client.pay(request);

        if (response && response.redirectUrl) {
            console.log("✅ Payment Redirect URL Generated.");
            res.json({
                success: true,
                url: response.redirectUrl
            });
        } else {
            console.error("❌ SDK Response Error: Redirect URL missing");
            res.status(400).json({ success: false, message: 'Payment Initiation Failed (SDK Error)' });
        }

    } catch (error) {
        console.error("🔥 SDK Exception (initiatePayment):", error.message);
        res.status(500).json({ success: false, message: "Payment Gateway Connection Error", error: error.message });
    }
};

/**
 * 2. CHECK STATUS (Post-Redirect)
 */
const checkStatus = async (req, res) => {
    // PhonePe might redirect via POST (req.body) or GET (req.params)
    const orderId = req.params.orderId || req.body.transactionId || req.body.merchantOrderId;
    console.log(`🔍 Official SDK Status Check for Order: ${orderId}`);

    try {
        const response = await client.getOrderStatus(orderId);

        // Official SDK mapping: COMPLETED, FAILED, PENDING
        if (response && response.state === 'COMPLETED') {
            const order = await Order.findByPk(orderId);

            if (order && order.status !== 'Processing') {
                // Update Order
                await order.update({ status: 'Processing', paymentMethod: 'Prepaid (PhonePe SDK)' });

                // Deduct Stock
                if (order.items && Array.isArray(order.items)) {
                    for (const item of order.items) {
                        const product = await Product.findByPk(item.id);
                        if (product) {
                            let updatedSizeStock = product.sizeStock ? { ...product.sizeStock } : {};
                            let totalStock = 0;

                            if (item.selectedSize && updatedSizeStock[item.selectedSize] !== undefined) {
                                updatedSizeStock[item.selectedSize] = Math.max(0, Number(updatedSizeStock[item.selectedSize]) - item.quantity);
                            }

                            if (Object.keys(updatedSizeStock).length > 0) {
                                Object.values(updatedSizeStock).forEach(qty => totalStock += Number(qty));
                            } else {
                                totalStock = Math.max(0, product.stock - item.quantity);
                            }

                            await product.update({ stock: totalStock, sizeStock: updatedSizeStock });
                        }
                    }
                }

                // Clear Cart
                if (order.userId && order.userId !== 'guest') {
                    await Cart.destroy({ where: { userId: order.userId } });
                }

                // Send Confirmations
                let email = null;
                if (order.billingDetails) {
                    if (typeof order.billingDetails === 'object') email = order.billingDetails.email;
                    else try { email = JSON.parse(order.billingDetails).email; } catch (e) { }
                }

                if (email) await sendCustomerStatusEmail(email, order.userName, orderId, "Received");
                await sendAdminNotification(order, orderId);
            }

            return res.redirect(`${FRONTEND_URL}/#/order-success?id=${orderId}&status=success`);

        } else if (response && response.state === 'FAILED') {
            await Order.update({ status: 'Payment Failed' }, { where: { id: orderId } });
            return res.redirect(`${FRONTEND_URL}/#/checkout?status=failed`);
        } else {
            console.log(`⏳ SDK Status: ${response ? response.state : 'PENDING'}`);
            return res.redirect(`${FRONTEND_URL}/#/checkout?status=pending`);
        }

    } catch (error) {
        console.error("🔥 SDK Exception (checkStatus):", error.message);
        return res.redirect(`${FRONTEND_URL}/#/checkout?status=error`);
    }
};

/**
 * 3. WEBHOOK HANDLING (S2S Callback)
 * PhonePe calls this URL directly to notify server about payment completion.
 */
const validateWebhook = async (req, res) => {
    console.log("🔔 Webhook received from PhonePe");
    try {
        const authHeader = req.headers['authorization'];
        const responseBody = JSON.stringify(req.body);

        // Official SDK validation method
        const callbackResponse = client.validateCallback(
            CALLBACK_USERNAME,
            CALLBACK_PASSWORD,
            authHeader,
            responseBody
        );

        if (callbackResponse && callbackResponse.payload) {
            const { orderId, state } = callbackResponse.payload;
            console.log(`✅ Webhook Validated. Order: ${orderId}, State: ${state}`);

            // Webhook success logic here
            return res.status(200).send("OK");
        }
    } catch (error) {
        console.error("❌ Webhook Validation Failed:", error.message);
        return res.status(401).send("Unauthorized");
    }
};

/**
 * 4. INITIATE REFUND (Helper)
 */
const initiateRefund = async (orderId, amount) => {
    try {
        const { RefundRequest } = require('pg-sdk-node');
        const refundId = `REFUND_${orderId}_${Date.now()}`;

        const request = RefundRequest.builder()
            .merchantRefundId(refundId)
            .originalMerchantOrderId(orderId)
            .amount(Math.round(amount * 100))
            .build();

        const response = await client.refund(request);
        console.log(`💸 Refund Processed. State: ${response.state}`);
        return response;
    } catch (error) {
        console.error("❌ Refund Error:", error.message);
        throw error;
    }
};

module.exports = { initiatePayment, checkStatus, validateWebhook, initiateRefund };
