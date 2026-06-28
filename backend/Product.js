const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// 1. Define Product Model
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    subCategory: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT, allowNull: false }, // Base Price
    discountPrice: { type: DataTypes.FLOAT },
    
    image: { type: DataTypes.TEXT('long'), allowNull: false }, 
    
    images: { 
        type: DataTypes.JSON, 
        defaultValue: [] 
    },
    description: { type: DataTypes.TEXT('long') },
    material: { type: DataTypes.STRING },
    rating: { type: DataTypes.FLOAT, defaultValue: 4.5 },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 }, // Total Stock (Sum)
    
    // Detailed Stock per Size
    sizeStock: {
        type: DataTypes.JSON, // Stores { "S": 10, "M": 5, "L": 0 }
        defaultValue: {}
    },

    // NEW: Detailed Price per Size
    sizePrices: {
        type: DataTypes.JSON, // Stores { "S": 1000, "M": 1200, "L": 1500 }
        defaultValue: {}
    },
    
    // NEW: Toggle to show/hide free size
    showFreeSize: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// EMPTY SEED DATA (Seed remove panniyachu)
const INITIAL_PRODUCTS = [];

const seedProducts = async () => {
    try {
        await Product.sync({ alter: true }); 
        
        // Check if manual column addition is needed for TiDB/MySQL strict mode
        try {
            const [results] = await sequelize.query(
                "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'sizePrices' AND TABLE_SCHEMA = DATABASE()"
            );
            if (results.length === 0) {
                console.log('⚙️ Adding missing "sizePrices" column...');
                await sequelize.query("ALTER TABLE Products ADD COLUMN sizePrices JSON");
            }
            
            const [fsResult] = await sequelize.query(
                "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'showFreeSize' AND TABLE_SCHEMA = DATABASE()"
            );
            if (fsResult.length === 0) {
                console.log('⚙️ Adding missing "showFreeSize" column...');
                await sequelize.query("ALTER TABLE Products ADD COLUMN showFreeSize BOOLEAN DEFAULT true");
            }
        } catch (e) { console.log('ℹ️ Table check passed.'); }

        const count = await Product.count();
        if (count === 0 && INITIAL_PRODUCTS.length > 0) {
            await Product.bulkCreate(INITIAL_PRODUCTS);
            console.log('✅ Initial Products Seeded!');
        } else {
            console.log('✅ Products Table Ready (No Seed Data)');
        }
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
};

module.exports = { Product, seedProducts };