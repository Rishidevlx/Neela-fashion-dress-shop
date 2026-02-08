const crypto = require('crypto');
const axios = require('axios');
const { Order } = require('./Order');
const { Cart } = require('./Cart');
const { Product } = require('./Product');
const { sendCustomerStatusEmail, sendAdminNotification } = require('./emailService');
require('dotenv').config();

// --- LOAD CREDENTIALS (V2 PRODUCTION) ---
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const SALT_KEY = process.env.PHONEPE_SALT_KEY || process.env.PHONEPE_CLIENT_SECRET; // Fallback if regular salt key missing
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;

const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || "https://api.phonepe.com/apis/hermes";

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

let cachedToken = null;
let tokenExpiry = 0;

// --- 1. GET ACCESS TOKEN (V2 AUTH) ---
const getAccessToken = async () => {
    try {
        // Return cached token if valid (buffer of 60 seconds)
        if (cachedToken && Date.now() < tokenExpiry - 60000) {
            return cachedToken;
        }

        console.log("🔄 Generating New PhonePe Access Token...");

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('client_version', '1'); // REQUIRED for V2

        // Auth URL for Production
        const authUrl = "https://api.phonepe.com/apis/hermes/v1/oauth/token";

        const response = await axios.post(authUrl, data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.data && response.data.access_token) {
            cachedToken = response.data.access_token;
            // Set expiry based on response (expires_in is in seconds)
            tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            console.log("✅ Access Token Generated Successfully");
            return cachedToken;
        } else {
            throw new Error("No access token in response");
        }

    } catch (error) {
        console.error("❌ Auth Token Error:", error.response ? error.response.data : error.message);
        throw new Error("Failed to authenticate with PhonePe");
    }
};

// --- 2. PAYMENT INITIATE (V2) ---
const initiatePayment = async (req, res) => {
    try {
        const { orderId, amount, userId, mobileNumber } = req.body;

        if (!MERCHANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
            return res.status(500).json({ success: false, message: "Server Error: Merchant Credentials Missing" });
        }

        // 1. Get Token First
        const accessToken = await getAccessToken();

        // 2. Prepare Payload
        const redirectUrl = `${BACKEND_URL}/api/payment/status/${orderId}`;
        const callbackUrl = `${BACKEND_URL}/api/payment/callback`;

        const data = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: orderId,
            merchantUserId: userId || "GUEST",
            amount: Math.round(Number(amount) * 100),
            redirectUrl: redirectUrl,
            redirectMode: "POST",
            callbackUrl: callbackUrl,
            mobileNumber: mobileNumber || "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');

        // 3. Generate Checksum (Still required for Pay API X-VERIFY)
        const stringToHash = payloadMain + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + "###" + SALT_INDEX;

        // 4. Send Request (With Token)
        const options = {
            method: 'POST',
            url: `${PHONEPE_HOST_URL}/pg/v1/pay`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'Authorization': `Bearer ${accessToken}` // NEW V2 HEADER
            },
            data: {
                request: payloadMain
            }
        };

        const response = await axios.request(options);

        if (response.data.success) {
            res.json({
                success: true,
                url: response.data.data.instrumentResponse.redirectInfo.url
            });
        } else {
            console.error("❌ PhonePe Error:", JSON.stringify(response.data));
            res.status(400).json({ success: false, message: 'Payment Failed', details: response.data });
        }

    } catch (error) {
        console.error("🔥 Exception:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Payment Gateway Connection Error" });
    }
};

// --- 3. CHECK STATUS (V2) ---
const checkStatus = async (req, res) => {
    const { orderId } = req.params;

    try {
        // 1. Get Token
        const accessToken = await getAccessToken();

        // 2. Prepare Checksum
        const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${orderId}` + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + "###" + SALT_INDEX;

        // 3. Call API (With Token)
        const options = {
            method: 'GET',
            url: `${PHONEPE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${orderId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID,
                'Authorization': `Bearer ${accessToken}` // NEW V2 HEADER
            }
        };

        const response = await axios.request(options);

        if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {

            // --- SUCCESS LOGIC (SAME AS BEFORE) ---
            await Order.update(
                { status: 'Processing', paymentMethod: 'Prepaid (PhonePe)' },
                { where: { id: orderId } }
            );

            const order = await Order.findByPk(orderId);

            if (order) {
                // Deduct Stock
                if (order.items && Array.isArray(order.items)) {
                    for (const item of order.items) {
                        const product = await Product.findByPk(item.id);
                        if (product) {
                            let updatedSizeStock = product.sizeStock ? { ...product.sizeStock } : {};
                            let totalStock = 0;

                            if (item.selectedSize && updatedSizeStock[item.selectedSize] !== undefined) {
                                const currentSizeQty = Number(updatedSizeStock[item.selectedSize]);
                                const newSizeQty = Math.max(0, currentSizeQty - item.quantity);
                                updatedSizeStock[item.selectedSize] = newSizeQty;
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

                // Send Emails
                let email = null;
                if (order.billingDetails) {
                    if (typeof order.billingDetails === 'object') email = order.billingDetails.email;
                    else if (typeof order.billingDetails === 'string') {
                        try { const details = JSON.parse(order.billingDetails); email = details.email; } catch (e) { }
                    }
                }

                if (email) await sendCustomerStatusEmail(email, order.userName, orderId, "Received");
                await sendAdminNotification(order, orderId);
            }

            return res.redirect(`${FRONTEND_URL}/#/order-success?id=${orderId}&status=success`);
        } else {
            // Payment Failed
            await Order.update(
                { status: 'Payment Failed' },
                { where: { id: orderId } }
            );
            return res.redirect(`${FRONTEND_URL}/#/checkout?status=failed`);
        }

    } catch (error) {
        console.error("Status Check Error:", error.response ? error.response.data : error.message);
        return res.redirect(`${FRONTEND_URL}/#/checkout?status=error`);
    }
};

module.exports = { initiatePayment, checkStatus };