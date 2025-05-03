require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Validate required environment variables
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    logger.warn('Using default values for missing environment variables. This is not recommended for production.');
}

// Create a Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'bookorbit',
    process.env.DB_USER || 'bookorbit_user',
    process.env.DB_PASSWORD || 'password',
    {
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 0,
            acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
            idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        retry: {
            max: parseInt(process.env.DB_RETRY_MAX) || 10,
            match: [
                /Deadlock/i,
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
                /SequelizeConnectionAcquireTimeoutError/,
                /Connection lost/i,
            ],
        },
    }
);

// Test the database connection with improved retry mechanism
const MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES) || 5;
const RETRY_DELAY = parseInt(process.env.DB_RETRY_DELAY) || 5000;

const connectWithRetry = async (retryCount = 0) => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection has been established successfully.');
        return true;
    } catch (error) {
        logger.error('❌ Unable to connect to the database:', error.message);
        
        if (retryCount < MAX_RETRIES) {
            logger.info(`Retrying connection in ${RETRY_DELAY/1000} seconds... (${MAX_RETRIES - retryCount} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectWithRetry(retryCount + 1);
        } else {
            logger.error('Maximum retry attempts reached. Exiting...');
            process.exit(1);
        }
    }
};

// Initialize connection
connectWithRetry().catch(error => {
    logger.error('Failed to establish database connection:', error);
    process.exit(1);
});

// Export the Sequelize instance
module.exports = sequelize;