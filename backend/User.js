const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const bcrypt = require('bcryptjs'); // Import bcrypt

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user' // 'admin' or 'user'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Extra profile fields
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    pincode: DataTypes.STRING
});

// Function to seed Admin User
const seedAdmin = async () => {
    try {
        await User.sync(); // Table create pannum if not exists
        
        const adminEmail = 'neelafashion@gmail.com';
        const plainPass = 'admin-neela';

        const adminExists = await User.findOne({ where: { email: adminEmail } });

        if (!adminExists) {
            // Hash the admin password before saving
            const hashedPassword = await bcrypt.hash(plainPass, 10);

            await User.create({
                name: 'Neela Admin',
                email: adminEmail,
                password: hashedPassword, // Storing Hashed Password
                role: 'admin',
                isActive: true
            });
            console.log('✅ Admin User Created Automatically with Hashed Password!');
        } else {
            console.log('ℹ️ Admin User already exists.');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};

module.exports = { User, seedAdmin };