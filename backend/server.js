const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
const { User, seedAdmin } = require('./User');
const { Product, seedProducts } = require('./Product');
const { CMS, seedCMS } = require('./CMS');
const { Category, seedCategories } = require('./Category');
const { Review, seedReviews } = require('./Review');
const { Cart, seedCart } = require('./Cart');
const { Order, seedOrders } = require('./Order');
const { Op } = require('sequelize'); // Import Op for filtering
const bcrypt = require('bcryptjs');

const { sendCustomerStatusEmail, sendContactInquiry } = require('./emailService');
const { initiatePayment, checkStatus, validateWebhook } = require('./paymentController');

require('dotenv').config();

const app = express();

// --- SMART CORS SETUP ---

const allowedOrigins = [
    'https://neelafashion.com',
    'https://www.neelafashion.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://api.neelafashion.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            return callback(null, true); // Allow all for now to prevent blocking
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send('Neela Fashion API is Running! 🚀');
});

// --- AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({ name, email, password: hashedPassword, phone, role: 'user', isActive: true });
        res.json({ success: true, message: 'Account created successfully!' });
    } catch (error) { res.status(500).json({ success: false, message: 'Server Error' }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid Password' });

        if (!user.isActive) return res.status(403).json({ success: false, message: 'Account Deactivated' });

        res.json({
            success: true,
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                phone: user.phone,
                address: user.address,
                city: user.city,
                district: user.district,
                state: user.state,
                pincode: user.pincode,
                joinDate: user.createdAt
            }
        });
    } catch (error) { res.status(500).json({ success: false, message: 'Server Error' }); }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/details', async (req, res) => {
    try {
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
        res.json({ success: true, email: admin.email });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.put('/api/admin/settings', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

        const updates = { email };
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }

        await admin.update(updates);
        res.json({ success: true, message: 'Admin credentials updated successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update' });
    }
});

// --- NEW: RESET DASHBOARD ROUTE ---
app.delete('/api/admin/reset-stats', async (req, res) => {
    try {
        // This effectively resets the dashboard by deleting all orders
        await Order.destroy({ where: {}, truncate: true });
        res.json({ success: true, message: 'Dashboard & Orders Reset Successfully!' });
    } catch (error) {
        console.error("Reset Error:", error);
        res.status(500).json({ success: false, message: 'Failed to reset data' });
    }
});

// --- CONTACT FORM ---
app.post('/api/contact/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const contactSettings = await CMS.findOne({ where: { type: 'contact' } });
        let toEmail = process.env.ADMIN_EMAIL;

        if (contactSettings && contactSettings.data) {
            const data = contactSettings.data;
            if (typeof data === 'object' && data.email) toEmail = data.email;
            else if (typeof data === 'string') {
                try { toEmail = JSON.parse(data).email; } catch (e) { }
            }
        }

        if (toEmail) {
            sendContactInquiry(toEmail, { name, email, subject, message });
            res.json({ success: true, message: 'Inquiry sent successfully!' });
        } else {
            res.status(500).json({ success: false, message: 'Contact email not configured.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
    try { const products = await Product.findAll({ order: [['createdAt', 'DESC']] }); res.json({ success: true, products }); }
    catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.json({ success: true, product: newProduct, message: 'Product Added!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to add product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try { const [updated] = await Product.update(req.body, { where: { id: req.params.id } }); if (updated) res.json({ success: true, message: 'Updated!' }); }
    catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Cart.destroy({ where: { productId: req.params.id } });
        await Product.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Deleted!' });
    }
    catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/products/bulk-delete', async (req, res) => {
    try {
        await Cart.destroy({ where: { productId: req.body.ids } });
        await Product.destroy({ where: { id: req.body.ids } });
        res.json({ success: true, message: 'Deleted!' });
    }
    catch (error) { res.status(500).json({ success: false }); }
});

// --- CART ROUTES ---
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cartItems = await Cart.findAll({ where: { userId }, include: Product });
        const mappedCart = cartItems.map(item => {
            const plainItem = item.toJSON();
            if (!plainItem.Product) return null;
            return {
                ...plainItem,
                Product: { ...plainItem.Product, image: plainItem.selectedImage || plainItem.Product.image },
                selectedSize: plainItem.selectedSize
            };
        }).filter(item => item !== null);
        res.json({ success: true, cart: mappedCart });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/cart/add', async (req, res) => {
    try {
        const { userId, productId, quantity, selectedImage, selectedSize } = req.body;
        const existingItem = await Cart.findOne({ where: { userId, productId, selectedSize: selectedSize || null } });
        if (existingItem) {
            existingItem.quantity += quantity;
            if (selectedImage) existingItem.selectedImage = selectedImage;
            await existingItem.save();
        } else {
            await Cart.create({ userId, productId, quantity, selectedImage, selectedSize });
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/cart/update', async (req, res) => {
    try {
        const { userId, productId, quantity, selectedSize } = req.body;
        await Cart.update({ quantity }, { where: { userId, productId, selectedSize: selectedSize || null } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/cart/remove', async (req, res) => {
    try {
        const { userId, productId, selectedSize } = req.body;
        await Cart.destroy({ where: { userId, productId, selectedSize: selectedSize || null } });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/cart/clear/:userId', async (req, res) => {
    try { await Cart.destroy({ where: { userId: req.params.userId } }); res.json({ success: true }); }
    catch (error) { res.status(500).json({ success: false }); }
});

// --- ORDER ROUTES ---

// Helper: restore stock when an order is cancelled
async function restoreStockForOrder(orderId, force = false) {
    try {
        const order = await Order.findByPk(orderId);
        if (!order) return { ok: false, reason: 'Order not found' };
        // Only restore if order was in an active (stock-deducted) state
        const nonDeductedStatuses = ['Pending', 'Payment Failed', 'Cancelled'];
        if (!force && nonDeductedStatuses.includes(order.status)) return { ok: false, reason: 'Stock was never deducted for this status' };

        let items = order.items;
        if (typeof items === 'string') { try { items = JSON.parse(items); } catch { return { ok: false, reason: 'Could not parse items' }; } }
        if (!Array.isArray(items) || items.length === 0) return { ok: false, reason: 'No items found' };

        for (const item of items) {
            const productId = item.id || item.productId;
            const size = item.selectedSize || item.size || null;
            const qty = Number(item.quantity || item.qty || 0);
            if (!productId || qty <= 0) continue;

            const product = await Product.findByPk(productId);
            if (!product) { console.warn(`Product ${productId} not found, skipping`); continue; }

            const updatedSizeStock = { ...(product.sizeStock || {}) };
            if (size && updatedSizeStock[size] !== undefined) {
                updatedSizeStock[size] = updatedSizeStock[size] + qty;
            } else if (size) {
                updatedSizeStock[size] = qty; // size key missing — add it back
            }
            const newTotal = product.stock + qty;
            await product.update({ stock: newTotal, sizeStock: updatedSizeStock });
            console.log(`  → Restored ${qty}x "${product.name}" ${size ? `(Size ${size})` : ''} | New total: ${newTotal}`);
        }
        console.log(`[Stock Restored] Order ${orderId} — stock added back.`);
        return { ok: true };
    } catch (err) {
        console.error('[Stock Restore Error]', err.message);
        return { ok: false, reason: err.message };
    }
}

app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        // CORRECTION: Stock deduction removed from here. Only happens on Payment Success.
        const newOrder = await Order.create(orderData);

        // No Email, No Stock Update here. Just Create Order.

        res.json({ success: true, order: newOrder, message: 'Order Created. Awaiting Payment.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to place order' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        // Now fetching ALL orders, including Pending and Payment Failed
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, orders });
    }
    catch (error) { res.status(500).json({ success: false }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Restore stock if admin is cancelling the order
        if (status === 'Cancelled') {
            await restoreStockForOrder(id);
        }

        await Order.update({ status }, { where: { id } });
        const order = await Order.findByPk(id);
        if (order) {
            let email = null;
            let name = order.userName;
            if (order.billingDetails) {
                if (typeof order.billingDetails === 'object') email = order.billingDetails.email;
                else if (typeof order.billingDetails === 'string') {
                    try { const details = JSON.parse(order.billingDetails); email = details.email; } catch (e) { }
                }
            }
            if (email) sendCustomerStatusEmail(email, name, id, status);
        }
        res.json({ success: true });
    }
    catch (error) { res.status(500).json({ success: false }); }
});

app.put('/api/orders/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        // Restore stock before marking as cancelled
        await restoreStockForOrder(id);
        await Order.update({ status: 'Cancelled' }, { where: { id } });
        const order = await Order.findByPk(id);
        let email = null;
        if (order && order.billingDetails) {
            if (typeof order.billingDetails === 'object') email = order.billingDetails.email;
            else try { email = JSON.parse(order.billingDetails).email; } catch (e) { }
        }
        if (email) sendCustomerStatusEmail(email, order.userName, id, "Cancelled");
        res.json({ success: true });
    }
    catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/orders/:id', async (req, res) => {
    try { await Order.destroy({ where: { id: req.params.id } }); res.json({ success: true, message: 'Order Deleted Permanently' }); }
    catch (error) { res.status(500).json({ success: false }); }
});

// Force-restore stock for an already-cancelled order (one-time manual fix)
app.post('/api/admin/restore-stock/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await restoreStockForOrder(orderId, true); // force=true bypasses the status guard
        if (result.ok) {
            res.json({ success: true, message: `Stock restored for order ${orderId}` });
        } else {
            res.status(400).json({ success: false, message: result.reason });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


// --- MANUAL ORDER ENTRY (Admin Panel) ---
app.post('/api/admin/manual-order', async (req, res) => {
    try {
        const { billingDetails, shippingDetails, items, paymentMethod, paymentStatus, notes } = req.body;

        if (!billingDetails || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Billing details and items are required.' });
        }

        // 1. Validate & fetch products, check stock
        const productRecords = [];
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) return res.status(404).json({ success: false, message: `Product not found: ID ${item.productId}` });

            const sizeStock = product.sizeStock || {};
            const currentSizeStock = item.size ? (sizeStock[item.size] || 0) : product.stock;

            if (item.qty > currentSizeStock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.name}"${item.size ? ` (Size: ${item.size})` : ''}. Available: ${currentSizeStock}`
                });
            }
            productRecords.push({ product, item });
        }

        // 2. Calculate shipping (same logic as Checkout.tsx)
        const targetState = (shippingDetails || billingDetails).state;
        let totalShipping = 0;

        let pranjulNightyQty = 0;
        let pranjulCollectionQty = 0;
        const otherCategoryGroups = {};

        for (const { product, item } of productRecords) {
            const cat = (product.category || '').toLowerCase();
            const sub = (product.subCategory || '').toLowerCase();
            const isCategory = (keyword) => cat.includes(keyword) || sub.includes(keyword);

            if (isCategory('pranjul') && isCategory('nighty')) {
                pranjulNightyQty += item.qty;
            } else if (isCategory('pranjul') && (isCategory('collection') || isCategory('collecion'))) {
                pranjulCollectionQty += item.qty;
            } else {
                otherCategoryGroups[product.category] = (otherCategoryGroups[product.category] || 0) + item.qty;
            }
        }

        if (pranjulNightyQty > 0) {
            if (targetState === 'Tamil Nadu') {
                totalShipping += pranjulNightyQty >= 3 ? 0 : 30;
            } else {
                totalShipping += pranjulNightyQty <= 4 ? 45 : 45 + ((pranjulNightyQty - 4) * 10);
            }
        }

        if (pranjulCollectionQty > 0) {
            if (targetState === 'Tamil Nadu') totalShipping += 40 + ((pranjulCollectionQty - 1) * 20);
            else totalShipping += 65 + ((pranjulCollectionQty - 1) * 25);
        }

        for (const [category, qty] of Object.entries(otherCategoryGroups)) {
            const categoryRecord = await Category.findByPk(category);
            const rules = categoryRecord ? (categoryRecord.shippingRules || []) : [];
            let matchedRule;

            if (rules.length > 0) {
                matchedRule = rules.find(r => r.state === targetState && qty >= r.minQty && qty <= r.maxQty);
                if (!matchedRule && targetState !== 'Tamil Nadu') matchedRule = rules.find(r => r.state === 'Other States' && qty >= r.minQty && qty <= r.maxQty);
                if (!matchedRule) matchedRule = rules.find(r => r.state === 'All States' && qty >= r.minQty && qty <= r.maxQty);

                if (matchedRule) {
                    let cost = matchedRule.cost;
                    if (matchedRule.type === 'per_piece') cost = matchedRule.cost * qty;
                    else if (matchedRule.type === 'every_2') cost = matchedRule.cost * Math.ceil(qty / 2);
                    else if (matchedRule.type === 'every_3') cost = matchedRule.cost * Math.ceil(qty / 3);
                    else if (matchedRule.type === 'every_10') cost = matchedRule.cost * Math.ceil(qty / 10);
                    totalShipping += cost;
                } else totalShipping += 50;
            } else totalShipping += 50;
        }

        // 3. Build order items (CartItem shape)
        let subtotal = 0;
        const orderItems = productRecords.map(({ product, item }) => {
            const unitPrice = item.size && product.sizePrices && product.sizePrices[item.size]
                ? product.sizePrices[item.size]
                : (product.discountPrice || product.price);
            subtotal += unitPrice * item.qty;
            return {
                id: product.id,
                name: product.name,
                category: product.category,
                subCategory: product.subCategory || '',
                price: product.price,
                discountPrice: product.discountPrice || null,
                image: product.image,
                quantity: item.qty,
                selectedSize: item.size || null,
                stock: product.stock,
                sizeStock: product.sizeStock
            };
        });

        const orderTotal = Number((subtotal + totalShipping).toFixed(2));

        // 4. Generate order ID
        const orderId = 'MAN-' + Date.now().toString().slice(-5);

        // 5. Deduct stock
        for (const { product, item } of productRecords) {
            const updatedSizeStock = { ...(product.sizeStock || {}) };
            if (item.size && updatedSizeStock[item.size] !== undefined) {
                updatedSizeStock[item.size] = Math.max(0, updatedSizeStock[item.size] - item.qty);
            }
            const newTotalStock = Math.max(0, product.stock - item.qty);
            await product.update({ stock: newTotalStock, sizeStock: updatedSizeStock });
        }

        // 6. Create order
        const customerName = `${billingDetails.firstName} ${billingDetails.lastName}`.trim();
        const newOrder = await Order.create({
            id: orderId,
            userId: 'manual',
            userName: customerName,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            total: orderTotal,
            status: 'Confirmed',
            paymentMethod: paymentMethod || 'Manual',
            items: orderItems,
            billingDetails,
            shippingDetails: shippingDetails || billingDetails,
            notes: notes || '',
            orderSource: 'manual'
        });

        res.json({ success: true, order: newOrder, message: 'Manual order placed successfully!', shipping: totalShipping });
    } catch (error) {
        console.error('Manual Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to place manual order: ' + error.message });
    }
});


// --- CATEGORIES ---
app.get('/api/categories', async (req, res) => { try { const categories = await Category.findAll(); res.json({ success: true, categories }); } catch { res.status(500).json({}); } });
app.post('/api/categories', async (req, res) => { try { await Category.create({ name: req.body.name, subCategories: [], shippingRules: req.body.rules || [] }); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.put('/api/categories/:name', async (req, res) => {
    const oldName = req.params.name;
    const { newName, rules, subCategories } = req.body;
    try {
        const category = await Category.findByPk(oldName);
        if (newName && newName !== oldName) {
            await Category.create({ name: newName, subCategories: subCategories || category.subCategories, shippingRules: rules || category.shippingRules });
            await Category.destroy({ where: { name: oldName } });
            await Product.update({ category: newName }, { where: { category: oldName } });
        } else {
            await category.update({ shippingRules: rules, subCategories: subCategories || category.subCategories });
        }
        res.json({ success: true });
    } catch { res.status(500).json({}); }
});
app.post('/api/categories/:name/sub', async (req, res) => {
    try { const category = await Category.findByPk(req.params.name); if (category) { const subs = category.subCategories || []; if (!subs.includes(req.body.subCategory)) { await category.update({ subCategories: [...subs, req.body.subCategory] }); res.json({ success: true }); } } } catch { res.status(500).json({}); }
});
app.delete('/api/categories/:name', async (req, res) => { try { await Category.destroy({ where: { name: req.params.name } }); res.json({ success: true }); } catch { res.status(500).json({}); } });

// --- CMS & OTHER ---
app.get('/api/users', async (req, res) => { try { const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] }); res.json({ success: true, users }); } catch { res.status(500).json({}); } });
app.put('/api/users/:id', async (req, res) => { try { const user = await User.findByPk(req.params.id); await user.update(req.body); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.delete('/api/users/:id', async (req, res) => { try { await User.destroy({ where: { id: req.params.id } }); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.put('/api/users/:id/status', async (req, res) => { try { const user = await User.findByPk(req.params.id); await user.update({ isActive: !user.isActive }); res.json({ success: true }); } catch { res.status(500).json({}); } });

app.get('/api/reviews', async (req, res) => { try { const reviews = await Review.findAll({ order: [['createdAt', 'DESC']] }); res.json({ success: true, reviews }); } catch { res.status(500).json({}); } });
app.post('/api/reviews', async (req, res) => { try { const newReview = await Review.create(req.body); res.json({ success: true, review: newReview }); } catch { res.status(500).json({}); } });
app.delete('/api/reviews/:id', async (req, res) => { try { await Review.destroy({ where: { id: req.params.id } }); res.json({ success: true }); } catch { res.status(500).json({}); } });

app.get('/api/cms/home', async (req, res) => { try { const c = await CMS.findOne({ where: { type: 'home' } }); res.json({ success: true, data: c?.data }); } catch { res.status(500).json({}); } });
app.put('/api/cms/home', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'home' } }); if (!u) await CMS.create({ type: 'home', data: req.body.data }); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.get('/api/cms/global-settings', async (req, res) => { try { const c = await CMS.findOne({ where: { type: 'global_settings' } }); res.json({ success: true, data: c?.data }); } catch { res.status(500).json({}); } });
app.put('/api/cms/global-settings', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'global_settings' } }); if (!u) await CMS.create({ type: 'global_settings', data: req.body.data }); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.get('/api/cms/about', async (req, res) => { try { const c = await CMS.findOne({ where: { type: 'about' } }); res.json({ success: true, data: c?.data }); } catch { res.status(500).json({}); } });
app.put('/api/cms/about', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'about' } }); if (!u) await CMS.create({ type: 'about', data: req.body.data }); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.get('/api/cms/contact', async (req, res) => { try { const c = await CMS.findOne({ where: { type: 'contact' } }); res.json({ success: true, data: c?.data }); } catch { res.status(500).json({}); } });
app.put('/api/cms/contact', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'contact' } }); if (!u) await CMS.create({ type: 'contact', data: req.body.data }); res.json({ success: true }); } catch { res.status(500).json({}); } });

// --- PHONEPE PAYMENT ROUTES ---
app.post('/api/payment/pay', initiatePayment);
app.all('/api/payment/status/:orderId', checkStatus); // Changed to app.all to handle both GET and POST redirects
app.post('/api/payment/callback', validateWebhook); // New Webhook Route

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to TiDB Database successfully!');
        await seedAdmin();
        await seedProducts();
        await seedCategories();
        await seedCMS();
        await seedReviews();
        await seedCart();
        await seedOrders();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Database Connection Failed:', error);
    }
};

startServer();