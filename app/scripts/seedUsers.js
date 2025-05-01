const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../services/db');

const sampleUsers = [
    {
        username: 'john_doe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        username: 'jane_smith',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        username: 'bob_wilson',
        first_name: 'Bob',
        last_name: 'Wilson',
        email: 'bob.wilson@example.com',
        password: 'password123',
        role: 'user'
    }
];

async function seedUsers() {
    try {
        for (const userData of sampleUsers) {
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: userData.email },
                        { username: userData.username }
                    ]
                }
            });

            if (!existingUser) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(userData.password, salt);

                await User.create({
                    ...userData,
                    password: hashedPassword
                });

                logger.info(`Created user: ${userData.username}`);
            }
        }

        logger.info('User seeding completed successfully');
    } catch (error) {
        logger.error('Error seeding users:', error);
        throw error;
    }
}

module.exports = seedUsers; 