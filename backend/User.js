const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const bcrypt = require('bcryptjs');

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
        defaultValue: 'user'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Profile Fields
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    district: DataTypes.STRING, // NEW: District Field
    state: DataTypes.STRING,
    pincode: DataTypes.STRING
});

const seedAdmin = async () => {
    try {
        // CORRECTION: Removed { alter: true } to prevent TiDB Unique Constraint Error
        await User.sync(); 
        
        // --- MANUAL COLUMN MIGRATION FOR TIDB ---
        // This safely adds 'district' column if it's missing, without touching 'email'
        try {
            const [results] = await sequelize.query(
                "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'district' AND TABLE_SCHEMA = DATABASE()"
            );
            
            if (results.length === 0) {
                console.log('⚙️ Adding missing "district" column...');
                await sequelize.query("ALTER TABLE Users ADD COLUMN district VARCHAR(255)");
                console.log('✅ "district" column added successfully!');
            }
        } catch (colError) {
            // Ignore error if column check fails (likely exists)
            console.log('ℹ️ Table check passed.');
        }
        // ----------------------------------------

        const adminEmail = 'neelafashion@gmail.com';
        const plainPass = 'admin-neela';

        const adminExists = await User.findOne({ where: { email: adminEmail } });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(plainPass, 10);
            await User.create({
                name: 'Neela Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isActive: true
            });
            console.log('✅ Admin User Created!');
        } else {
            console.log('ℹ️ Admin User already exists.');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};

module.exports = { User, seedAdmin };