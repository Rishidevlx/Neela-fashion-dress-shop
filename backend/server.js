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
const bcrypt = require('bcryptjs');

// IMPORT SERVICES
const { sendCustomerStatusEmail, sendAdminNotification, sendContactInquiry } = require('./emailService');
const { initiatePayment, checkStatus } = require('./paymentController');

require('dotenv').config();

const app = express();

// --- SMART CORS SETUP (Works for Local & Live) ---
const allowedOrigins = [
    'https://neelafashion.com',       // Live Frontend
    'https://www.neelafashion.com',   // Live WWW
    'http://localhost:5173',          // Local Vite Frontend
    'http://localhost:3000',          // Alternative Local
    'http://127.0.0.1:5173'           // IP based Local
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        } else {
            // Optional: Log blocked origins for debugging
            console.log("Blocked CORS Origin:", origin);
            return callback(new Error('CORS Policy Violation'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Payload Limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root Route
app.get('/', (req, res) => {
    res.send('Neela Fashion API is Running! (Local & Production Ready) 🚀');
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
                try { toEmail = JSON.parse(data).email; } catch(e){}
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
    try { const [updated] = await Product.update(req.body, { where: { id: req.params.id } }); if(updated) res.json({ success: true, message: 'Updated!' }); } 
    catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/products/:id', async (req, res) => {
    try { await Product.destroy({ where: { id: req.params.id } }); res.json({ success: true, message: 'Deleted!' }); } 
    catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/products/bulk-delete', async (req, res) => {
    try { await Product.destroy({ where: { id: req.body.ids } }); res.json({ success: true, message: 'Deleted!' }); } 
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
            if(selectedImage) existingItem.selectedImage = selectedImage;
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
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = await Order.create(orderData);
        
        if (orderData.items && Array.isArray(orderData.items)) {
            for (const item of orderData.items) {
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

        if(orderData.billingDetails && orderData.billingDetails.email) {
             sendCustomerStatusEmail(orderData.billingDetails.email, orderData.userName, newOrder.id, "Received");
        }
        sendAdminNotification(orderData, newOrder.id);

        res.json({ success: true, order: newOrder, message: 'Order Placed Successfully!' });
    } catch (error) { 
        res.status(500).json({ success: false, message: 'Failed to place order' }); 
    }
});

app.get('/api/orders', async (req, res) => {
    try { const orders = await Order.findAll({ order: [['createdAt', 'DESC']] }); res.json({ success: true, orders }); } 
    catch (error) { res.status(500).json({ success: false }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try { 
        const { id } = req.params;
        const { status } = req.body;
        await Order.update({ status }, { where: { id } });
        const order = await Order.findByPk(id);
        if (order) {
            let email = null;
            let name = order.userName;
            if (order.billingDetails) {
                if (typeof order.billingDetails === 'object') email = order.billingDetails.email;
                else if (typeof order.billingDetails === 'string') {
                    try { const details = JSON.parse(order.billingDetails); email = details.email; } catch (e) {}
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
        await Order.update({ status: 'Cancelled' }, { where: { id } }); 
        const order = await Order.findByPk(id);
        let email = null;
        if (order && order.billingDetails) {
             if (typeof order.billingDetails === 'object') email = order.billingDetails.email;
             else try { email = JSON.parse(order.billingDetails).email; } catch(e){}
        }
        if(email) sendCustomerStatusEmail(email, order.userName, id, "Cancelled");
        res.json({ success: true }); 
    } 
    catch (error) { res.status(500).json({ success: false }); }
});

app.delete('/api/orders/:id', async (req, res) => {
    try { await Order.destroy({ where: { id: req.params.id } }); res.json({ success: true, message: 'Order Deleted Permanently' }); } 
    catch (error) { res.status(500).json({ success: false }); }
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
    try { const category = await Category.findByPk(req.params.name); if(category) { const subs = category.subCategories || []; if(!subs.includes(req.body.subCategory)) { await category.update({ subCategories: [...subs, req.body.subCategory] }); res.json({ success: true }); } } } catch { res.status(500).json({}); }
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
app.put('/api/cms/home', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'home' } }); if(!u) await CMS.create({type:'home', data: req.body.data}); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.get('/api/cms/global-settings', async (req, res) => { try { const c = await CMS.findOne({ where: { type: 'global_settings' } }); res.json({ success: true, data: c?.data }); } catch { res.status(500).json({}); } });
app.put('/api/cms/global-settings', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'global_settings' } }); if(!u) await CMS.create({type:'global_settings', data: req.body.data}); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.get('/api/cms/about', async (req, res) => { try { const c = await CMS.findOne({ where: { type: 'about' } }); res.json({ success: true, data: c?.data }); } catch { res.status(500).json({}); } });
app.put('/api/cms/about', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'about' } }); if(!u) await CMS.create({type:'about', data: req.body.data}); res.json({ success: true }); } catch { res.status(500).json({}); } });
app.get('/api/cms/contact', async (req, res) => { try { const c = await CMS.findOne({ where: { type: 'contact' } }); res.json({ success: true, data: c?.data }); } catch { res.status(500).json({}); } });
app.put('/api/cms/contact', async (req, res) => { try { const [u] = await CMS.update({ data: req.body.data }, { where: { type: 'contact' } }); if(!u) await CMS.create({type:'contact', data: req.body.data}); res.json({ success: true }); } catch { res.status(500).json({}); } });

// --- PHONEPE PAYMENT ROUTES ---
app.post('/api/payment/pay', initiatePayment);
app.post('/api/payment/status/:orderId', checkStatus);

// Server Start
// Sofyhost (cPanel) environment variable sets the PORT
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