const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const { Product } = require('./Product');

// 1. Define Cart Model
const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    selectedImage: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    selectedSize: {
        type: DataTypes.STRING, // NEW: Stores "XL", "M", etc.
        allowNull: true
    }
});

// 2. Setup Relationships
Cart.belongsTo(Product, { foreignKey: 'productId' });

// 3. Sync Function
const seedCart = async () => {
    try {
        await Cart.sync({ alter: true });
        console.log('✅ Cart Table Synced!');
    } catch (error) {
        console.error('❌ Error syncing Cart:', error);
    }
};

module.exports = { Cart, seedCart };