const sequelize = require('./db');
const User = require('../models/User');
const Book = require('../models/Book');
const UserBook = require('../models/UserBook');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const seedUsers = require('../scripts/seedUsers');

async function initializeDatabase() {
    try {
        // Sync all models with the database
        await sequelize.sync({ alter: true });
        logger.info('Database synchronized successfully');

        // Check if admin user exists
        const adminExists = await User.findOne({
            where: {
                role: 'admin'
            }
        });

        // Create admin user if it doesn't exist
        if (!adminExists) {
            const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                username: 'admin',
                first_name: 'Admin',
                last_name: 'User',
                email: 'admin@bookorbit.com',
                password: hashedPassword,
                role: 'admin'
            });

            logger.info('Admin user created successfully');
        }

        // Seed sample users
        await seedUsers();

    } catch (error) {
        logger.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = initializeDatabase; 