const nodemailer = require('nodemailer');
require('dotenv').config();

// --- 1. CONFIGURATION ---
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ WARNING: Email settings are missing in .env file.");
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email Service Error:", error.message);
    } else {
        console.log("✅ Email Service is Ready & Connected!");
    }
});

// --- 2. STYLES & TEMPLATES (Private Helper) ---
const getBaseStyles = () => `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background-color: #1e2a4a; color: #c48b36; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
    .content { padding: 40px 30px; color: #333333; }
    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 50px; font-weight: bold; font-size: 14px; margin-top: 10px; text-transform: uppercase; color: white; }
    .order-info { background-color: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #1e2a4a; }
    .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #1e2a4a; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
`;

// --- 3. CUSTOMER EMAIL LOGIC ---
const sendCustomerStatusEmail = async (toEmail, customerName, orderId, status) => {
    if (!toEmail) return;

    let message = `Your order status has been updated.`;
    let subject = `Update on Order #${orderId}`;
    let statusColor = '#1e2a4a'; // Navy

    if (status === 'Pending' || status === 'Received') {
        subject = `Order Confirmation #${orderId}`;
        message = `Thank you for your purchase! We have received your order and it is currently being processed.`;
        statusColor = '#eab308'; // Gold
    } else if (status === 'Shipped') {
        subject = `Great News! Order #${orderId} Shipped`;
        message = `Your order has been packed with care and is on its way to you.`;
        statusColor = '#3b82f6'; // Blue
    } else if (status === 'Delivered') {
        subject = `Order Delivered #${orderId}`;
        message = `Your order has been delivered. We hope you love your new purchase!`;
        statusColor = '#22c55e'; // Green
    } else if (status === 'Cancelled') {
        subject = `Order Cancelled #${orderId}`;
        message = `Your order has been cancelled. If you have any questions, please contact support.`;
        statusColor = '#ef4444'; // Red
    }

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head><style>${getBaseStyles()}</style></head>
    <body>
        <div class="container">
            <div class="header"><h1>Neela Fashion</h1></div>
            <div class="content">
                <p style="font-size: 18px;">Hello <strong>${customerName}</strong>,</p>
                <p>${message}</p>
                <div class="order-info" style="border-left-color: ${statusColor};">
                    <p style="margin: 0 0 10px 0; color: #666;">Order ID: <strong>#${orderId}</strong></p>
                    <p style="margin: 0;">Current Status:</p>
                    <span class="status-badge" style="background-color: ${statusColor};">${status}</span>
                </div>
                <p>We are committed to delivering luxury & excellence to your doorstep.</p>
                <div style="text-align: center;"><a href="https://neelafashion.com" class="btn">Visit Store</a></div>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} Neela Fashion.</p></div>
        </div>
    </body>
    </html>`;

    try {
        await transporter.sendMail({
            from: `"Neela Fashion" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: subject,
            html: htmlTemplate
        });
        console.log(`📧 Customer Email sent to ${toEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send Customer Email:`, error.message);
    }
};

// --- 4. ADMIN NOTIFICATION LOGIC ---
const sendAdminNotification = async (orderData, orderId) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER; 

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head><style>${getBaseStyles()}</style></head>
    <body>
        <div class="container">
            <div class="header" style="background-color: #000; color: #fff;"><h1>NEW ORDER ALERT 🔔</h1></div>
            <div class="content">
                <p style="font-size: 18px;">Hello Admin,</p>
                <p>You have received a new order! Time to get packing.</p>
                <div class="order-info">
                    <p><strong>Order ID:</strong> #${orderId}</p>
                    <p><strong>Customer:</strong> ${orderData.userName}</p>
                    <p><strong>Amount:</strong> ₹${orderData.total}</p>
                    <p><strong>Payment:</strong> ${orderData.paymentMethod}</p>
                    <p><strong>Items:</strong> ${orderData.items.length}</p>
                </div>
                <div style="text-align: center;"><a href="http://localhost:3000/#/admin" class="btn">View in Admin Panel</a></div>
            </div>
            <div class="footer"><p>Neela Fashion Automated System</p></div>
        </div>
    </body>
    </html>`;

    try {
        await transporter.sendMail({
            from: `"Neela System" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🔔 New Order Received: #${orderId} from ${orderData.userName}`,
            html: htmlTemplate
        });
        console.log(`🔔 Admin Notification sent to ${adminEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send Admin Notification:`, error.message);
    }
};

// --- 5. CONTACT FORM INQUIRY LOGIC (NEW) ---
const sendContactInquiry = async (toEmail, inquiryData) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head><style>${getBaseStyles()}</style></head>
    <body>
        <div class="container">
            <div class="header" style="background-color: #1e2a4a; color: #fff;"><h1>NEW INQUIRY 📩</h1></div>
            <div class="content">
                <p>Hello,</p>
                <p>You have received a new inquiry from the website Contact Form.</p>
                <div class="order-info">
                    <p><strong>Name:</strong> ${inquiryData.name}</p>
                    <p><strong>Email:</strong> ${inquiryData.email}</p>
                    <p><strong>Subject:</strong> ${inquiryData.subject}</p>
                    <p><strong>Message:</strong></p>
                    <p style="font-style: italic; color: #555;">"${inquiryData.message}"</p>
                </div>
            </div>
            <div class="footer"><p>Neela Fashion Automated System</p></div>
        </div>
    </body>
    </html>`;

    try {
        await transporter.sendMail({
            from: `"Website Inquiry" <${process.env.SMTP_USER}>`, // Sent via system email
            replyTo: inquiryData.email, // Admin can reply directly to customer
            to: toEmail, // The email set in Admin -> Contact Content
            subject: `📩 Inquiry: ${inquiryData.subject}`,
            html: htmlTemplate
        });
        console.log(`📩 Inquiry sent to ${toEmail}`);
    } catch (error) {
        console.error(`❌ Failed to send Inquiry:`, error.message);
    }
};

module.exports = { sendCustomerStatusEmail, sendAdminNotification, sendContactInquiry };