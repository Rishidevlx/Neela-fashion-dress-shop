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
    price: { type: DataTypes.FLOAT, allowNull: false },
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
    
    // NEW: Detailed Stock per Size
    sizeStock: {
        type: DataTypes.JSON, // Stores { "S": 10, "M": 5, "L": 0 }
        defaultValue: {}
    }
});

const seedProducts = async () => {
    try {
        await Product.sync({ alter: true }); 
        console.log('✅ Products Table Synced!');
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    }
};

module.exports = { Product, seedProducts };