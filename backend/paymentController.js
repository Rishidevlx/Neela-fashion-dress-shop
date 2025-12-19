const crypto = require('crypto');
const axios = require('axios');
const { Order } = require('./Order');
const { Cart } = require('./Cart');
const { Product } = require('./Product'); // Import Product for Stock update
const { sendCustomerStatusEmail, sendAdminNotification } = require('./emailService');
require('dotenv').config();

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || "https://api.phonepe.com/apis/hermes";

// FIX: Trim URLs to remove accidental spaces causing %20 errors
const BACKEND_URL = process.env.BACKEND_URL ? process.env.BACKEND_URL.trim() : "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : "http://localhost:3000";

const initiatePayment = async (req, res) => {
    try {
        const { orderId, amount, userId, mobileNumber } = req.body;

        if (!MERCHANT_ID || !SALT_KEY) {
            return res.status(500).json({ success: false, message: "Server Error: Merchant Credentials Missing" });
        }

        if (!orderId || !amount) {
            return res.status(400).json({ success: false, message: "Order ID or Amount missing" });
        }

        const data = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: orderId,
            merchantUserId: userId || "GUEST",
            amount: Math.round(Number(amount) * 100),
            redirectUrl: `${BACKEND_URL}/api/payment/status/${orderId}`,
            redirectMode: "POST",
            callbackUrl: `${BACKEND_URL}/api/payment/callback`,
            mobileNumber: mobileNumber || "9999999999",
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const stringToHash = payloadMain + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + "###" + SALT_INDEX;

        const options = {
            method: 'POST',
            url: `${PHONEPE_HOST_URL}/pg/v1/pay`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
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
            console.error("❌ PhonePe Production Error:", JSON.stringify(response.data));
            res.status(400).json({ success: false, message: 'Payment Failed', details: response.data });
        }

    } catch (error) {
        console.error("🔥 Exception:", error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: "Payment Gateway Connection Error" });
    }
};

const checkStatus = async (req, res) => {
    const { orderId } = req.params;

    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${orderId}` + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + SALT_INDEX;

    const options = {
        method: 'GET',
        url: `${PHONEPE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${orderId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        }
    };

    try {
        const response = await axios.request(options);

        if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
            
            // 1. UPDATE STATUS
            await Order.update(
                { status: 'Processing', paymentMethod: 'Prepaid (PhonePe)' }, 
                { where: { id: orderId } }
            );

            // 2. FETCH ORDER
            const order = await Order.findByPk(orderId);
            
            if (order) {
                // 3. DEDUCT STOCK (Moved here so it only happens on success)
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
                            // Recalculate total stock
                            if (Object.keys(updatedSizeStock).length > 0) {
                                Object.values(updatedSizeStock).forEach(qty => totalStock += Number(qty));
                            } else {
                                totalStock = Math.max(0, product.stock - item.quantity);
                            }
                            await product.update({ stock: totalStock, sizeStock: updatedSizeStock });
                        }
                    }
                }

                // 4. CLEAR CART
                if (order.userId && order.userId !== 'guest') {
                    await Cart.destroy({ where: { userId: order.userId } });
                }

                // 5. SEND EMAILS
                let email = null;
                if (order.billingDetails) {
                    if (typeof order.billingDetails === 'object') email = order.billingDetails.email;
                    else if (typeof order.billingDetails === 'string') {
                        try { const details = JSON.parse(order.billingDetails); email = details.email; } catch (e) {}
                    }
                }
                if (email) await sendCustomerStatusEmail(email, order.userName, orderId, "Received");
                await sendAdminNotification(order, orderId);
            }

            return res.redirect(`${FRONTEND_URL}/#/order-success?id=${orderId}&status=success`);
        } else {
            await Order.update(
                { status: 'Payment Failed' }, 
                { where: { id: orderId } }
            );
            return res.redirect(`${FRONTEND_URL}/#/checkout?status=failed`);
        }

    } catch (error) {
        console.error("Status Check Error:", error);
        return res.redirect(`${FRONTEND_URL}/#/checkout?status=error`);
    }
};

module.exports = { initiatePayment, checkStatus };