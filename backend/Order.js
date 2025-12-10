const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.STRING, // e.g., "ORD-12345"
        primaryKey: true
    },
    userId: {
        type: DataTypes.STRING, // "guest" or User ID
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING
    },
    date: {
        type: DataTypes.STRING
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    paymentMethod: {
        type: DataTypes.STRING, // 'Prepaid' or 'COD'
        allowNull: false
    },
    items: {
        type: DataTypes.JSON, // Store array of cart items
        allowNull: false
    },
    billingDetails: {
        type: DataTypes.JSON, // Store address object
        allowNull: false
    },
    shippingDetails: {
        type: DataTypes.JSON,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT, // New field for Order Notes
        allowNull: true
    }
});

const seedOrders = async () => {
    try {
        await Order.sync({ alter: true }); // Use alter: true to update table schema without deleting data
        console.log('✅ Order Table Synced!');
    } catch (error) {
        console.error('❌ Error syncing Orders:', error);
    }
};

module.exports = { Order, seedOrders };