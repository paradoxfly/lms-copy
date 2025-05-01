const sequelize = require('../services/db');
const Book = require('../models/Book');
const User = require('../models/User');
const Like = require('../models/Like');
const Star = require('../models/Star');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

const syncDatabase = async () => {
  try {
    // Safety check for production environment
    if (process.env.NODE_ENV === 'production') {
      logger.error('❌ Refusing to sync database in production environment');
      process.exit(1);
    }

    // Drop existing tables in correct order with proper error handling
    logger.info('Dropping existing tables...');
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      
      const tables = ['Likes', 'Stars', 'UserBooks', 'Transactions', 'Users', 'Books'];
      for (const table of tables) {
        try {
          await sequelize.query(`DROP TABLE IF EXISTS ${table}`);
          logger.info(`✅ Dropped table: ${table}`);
        } catch (error) {
          logger.error(`❌ Error dropping table ${table}:`, error.message);
          throw error;
        }
      }
      
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      logger.info('✅ All tables dropped successfully');
    } catch (error) {
      logger.error('❌ Error during table cleanup:', error.message);
      throw error;
    }

    // Sync all models with the database with proper error handling
    try {
      await sequelize.sync({ 
        force: process.env.NODE_ENV === 'test', // Only force sync in test environment
        alter: process.env.NODE_ENV === 'development' // Use alter in development
      });
      logger.info('✅ Database synced successfully');
    } catch (error) {
      logger.error('❌ Error syncing database:', error.message);
      throw error;
    }

    // Initialize with test data if in development or test environment
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Create test books
        const books = await Book.bulkCreate([
          {
            title: 'Test Book 1',
            author: 'Test Author 1',
            description: 'Test Description 1',
            isbn: 'TEST-ISBN-1',
            genre: 'Fiction',
            no_of_copies: 5,
            no_of_copies_available: 5
          },
          {
            title: 'Test Book 2',
            author: 'Test Author 2',
            description: 'Test Description 2',
            isbn: 'TEST-ISBN-2',
            genre: 'Non-Fiction',
            no_of_copies: 3,
            no_of_copies_available: 3
          }
        ]);
        logger.info('✅ Test books created successfully');

        // Create a test user with proper password hashing
        const user = await User.create({
          username: 'testuser',
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'user'
        });
        logger.info('✅ Test user created successfully');

        // Add test likes and stars
        await Promise.all([
          Like.create({ user_id: user.user_id, book_id: books[0].book_id }),
          Star.create({ user_id: user.user_id, book_id: books[1].book_id })
        ]);
        logger.info('✅ Test likes and stars created successfully');
      } catch (error) {
        logger.error('❌ Error creating test data:', error.message);
        throw error;
      }
    }
  } catch (error) {
    logger.error('❌ Database sync failed:', error.message);
    process.exit(1);
  }
};

// Export the sync function
module.exports = syncDatabase; 