const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// 1. Define CMS Model
const CMS = sequelize.define('CMS', {
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    data: {
        type: DataTypes.JSON,
        allowNull: false
    }
});

// 2. Default Data
const DEFAULT_HOME_CONTENT = {
    heroTitle: 'Classic Aura',
    heroSubtitle: 'Experience the epitome of craftsmanship. Where timeless tradition meets modern luxury.',
    heroImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1924&auto=format&fit=crop',
    marqueeText: ["Handcrafted Heritage", "Luxury Redefined", "Pure Gold Zari", "Timeless Elegance"],
    sectionTitleTrends: 'Curated Trends',
    sectionTitleFeatured: 'Trending Now',
    sectionTitleTestimonials: 'Voices of Elegance',
    testimonials: [
      { id: 1, text: "Absolutely stunning craftsmanship. The saree I ordered for my wedding was beyond my expectations.", author: "Ananya S.", role: "Verified Buyer" },
      { id: 2, text: "Neela has completely redefined luxury ethnic wear. The attention to detail in the embroidery is unmatched.", author: "Priya M.", role: "Fashion Blogger" },
      { id: 3, text: "The customer service is as impeccable as the clothes. They helped me choose the perfect gift.", author: "Rohan K.", role: "Loyal Customer" },
    ],
    trendImages: {
      large: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000',
      topRight: 'https://images.unsplash.com/photo-1605763240004-7e93b172d754?w=600&q=80',
      bottomRight: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800'
    }
};

const DEFAULT_GLOBAL_SETTINGS = {
    logoUrl: 'https://i.ibb.co/jJ5z8y2/neela-logo-mock.png', 
    siteName: 'Neela Fashion',
    currency: '₹',
    logoWidth: '80px',
    taxRate: 5
};

const DEFAULT_ABOUT_CONTENT = {
    title: 'Weaving Stories in Every Thread',
    description: 'Neela Fashion was born from a desire to preserve the dying art of traditional handloom while adapting it for the contemporary woman. \n\n We believe in sustainable fashion that empowers local artisans.',
    heroImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000'
};

// NEW: Default Contact Content
const DEFAULT_CONTACT_CONTENT = {
    address: 'Neela Fashion House, 123 Silk Avenue, Bangalore, Karnataka 560001',
    phone: '+91 98765 43210',
    email: 'concierge@neela.com',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.001696423075!2d77.59456271482193!3d12.97159879085577!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1629361234567!5m2!1sen!2sin',
    heroImage: 'https://www.transparenttextures.com/patterns/cubes.png'
};

// 3. Seeding Function
const seedCMS = async () => {
    try {
        await CMS.sync(); 
        
        // Seed Home
        const homeContent = await CMS.findOne({ where: { type: 'home' } });
        if (!homeContent) {
            await CMS.create({ type: 'home', data: DEFAULT_HOME_CONTENT });
            console.log('✅ Default Home Content Seeded!');
        }

        // Seed Global Settings
        const globalSettings = await CMS.findOne({ where: { type: 'global_settings' } });
        if (!globalSettings) {
            await CMS.create({ type: 'global_settings', data: DEFAULT_GLOBAL_SETTINGS });
            console.log('✅ Default Global Settings Seeded!');
        }

        // Seed About Content
        const aboutContent = await CMS.findOne({ where: { type: 'about' } });
        if (!aboutContent) {
            await CMS.create({ type: 'about', data: DEFAULT_ABOUT_CONTENT });
            console.log('✅ Default About Content Seeded!');
        }

        // Seed Contact Content (NEW)
        const contactContent = await CMS.findOne({ where: { type: 'contact' } });
        if (!contactContent) {
            await CMS.create({ type: 'contact', data: DEFAULT_CONTACT_CONTENT });
            console.log('✅ Default Contact Content Seeded!');
        }

    } catch (error) {
        console.error('❌ Error seeding CMS:', error);
    }
};

module.exports = { CMS, seedCMS };