const sequelize = require('./db');
const User = require('../models/User');
const Book = require('../models/Book');
const UserBook = require('../models/UserBook');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const seedUsers = require('../scripts/seedUsers');
const Like = require('../models/Like');
const Star = require('../models/Star');

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

        // Add associations after all models are imported
        Like.belongsTo(User, { foreignKey: 'user_id' });
        Like.belongsTo(Book, { foreignKey: 'book_id' });
        User.belongsToMany(Book, {
            through: Like,
            as: 'LikedBooks',
            foreignKey: 'user_id',
            otherKey: 'book_id'
        });
        Book.belongsToMany(User, {
            through: Like,
            as: 'Likers',
            foreignKey: 'book_id',
            otherKey: 'user_id'
        });
        // StarredBooks association
        Star.belongsTo(User, { foreignKey: 'user_id' });
        Star.belongsTo(Book, { foreignKey: 'book_id' });
        User.belongsToMany(Book, {
            through: Star,
            as: 'StarredBooks',
            foreignKey: 'user_id',
            otherKey: 'book_id'
        });
        Book.belongsToMany(User, {
            through: Star,
            as: 'Starrers',
            foreignKey: 'book_id',
            otherKey: 'user_id'
        });

    } catch (error) {
        logger.error('Error initializing database:', error);
        throw error;
    }
}

module.exports = initializeDatabase; 