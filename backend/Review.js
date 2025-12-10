const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productName: {
        type: DataTypes.STRING
    },
    userId: {
        type: DataTypes.INTEGER, // Or String if your user IDs are strings
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING
    },
    rating: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    comment: {
        type: DataTypes.TEXT
    },
    date: {
        type: DataTypes.STRING
    },
    image: {
        type: DataTypes.TEXT('long') // Base64 images can be large
    }
});

const seedReviews = async () => {
    try {
        await Review.sync();
        console.log('✅ Review Table Synced!');
    } catch (error) {
        console.error('❌ Error seeding Reviews:', error);
    }
};

module.exports = { Review, seedReviews };