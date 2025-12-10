const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// 1. Define Category Model
const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        primaryKey: true, // Category Name is unique ID
        allowNull: false
    },
    subCategories: {
        type: DataTypes.JSON, // Stores array of strings ["Saree", "Silk"]
        defaultValue: []
    },
    shippingRules: {
        type: DataTypes.JSON, // Stores array of rule objects
        defaultValue: []
    }
});

// 2. Default Data (From your types.ts)
const INITIAL_CATEGORIES = {
  "Bottom Wear": ["Ankle Length", "Cotton Patiyala", "Four way Leggins", "Full Length", "Leggins", "Patiyala", "Two way Leggins", "Viscose Patiyala"],
  "Dupatta": ["Low Price Dupatta", "Nazeem Dupatta", "Plain Cotton Dupatta", "Printed Cotton Dupatta"],
  "Inner wear": ["Brasier", "Panties", "Slips"],
  "Kurtis Collections": ["A line Kurti", "Aliya cut Kurti", "Feeding Kurti", "Long Gown", "Nyra Cut Kurti", "Side Open Kurti", "Three piece set", "Two Piece Set", "Umberlla Kurti"],
  "Nighty": ["3/4 Nighty", "60 Inch Nighty", "Baniyan Cloth Night Dress", "Cotton Night Dress", "Dupatta Nighty", "Feeding Nighty", "Feeding Zipless", "Full Open Nighty", "Non Feeding", "Other Brand Nighty", "Pranjul brand nighty", "T-Shirts"],
  "Unstiched Material": ["Cotton Material", "Georgette material", "Other Material", "Silk Material"],
  "Readymade": ["Cotton with Lining", "Cotton without Lining", "Mixed Cotton Fullset", "Rayon Fullset", "Two piece set"],
  "Saree": ["Cotton Saree", "Creape Saree", "Linen Saree", "Poonam Saree", "Silk Saree"]
};

// Default Rules
const DEFAULT_RULES = [
    { state: 'All States', minQty: 1, maxQty: 5, cost: 50, type: 'fixed' },
    { state: 'All States', minQty: 6, maxQty: 9999, cost: 0, type: 'fixed' }
];

// 3. Seeding Function
const seedCategories = async () => {
    try {
        await Category.sync();
        const count = await Category.count();

        if (count === 0) {
            const bulkData = Object.entries(INITIAL_CATEGORIES).map(([name, subs]) => ({
                name,
                subCategories: subs,
                shippingRules: DEFAULT_RULES
            }));
            
            await Category.bulkCreate(bulkData);
            console.log('✅ Default Categories Seeded!');
        } else {
            console.log('ℹ️ Categories already exist.');
        }
    } catch (error) {
        console.error('❌ Error seeding Categories:', error);
    }
};

module.exports = { Category, seedCategories };