require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'BookOrbit', // Database name
    process.env.DB_USER || 'bookorbit_user', // Database user
    process.env.DB_PASSWORD || 'password', // Database password
    {
        host: process.env.DB_HOST || 'db', // Database host
        port: process.env.DB_PORT || 3306, // Database port
        dialect: 'mysql', // Database dialect
        pool: {
            max: 10, // Maximum number of connections in the pool
            min: 0, // Minimum number of connections in the pool
            acquire: 30000, // Maximum time (in milliseconds) that a connection can be idle before being released
            idle: 10000, // Maximum time (in milliseconds) that a connection can be idle before being released
        },
        logging: false, // Disable logging for production
        retry: {
            max: 10, // Maximum retry attempts
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

// Test the database connection with retries
let retries = 5;
const connectWithRetry = async () => {
    while (retries) {
        try {
            await sequelize.authenticate();
            console.log('✅ Database connection has been established successfully.');
            return;
        } catch (error) {
            console.error('❌ Unable to connect to the database:', error);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (retries === 0) {
                process.exit(1);
            }
            // Wait for 5 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

connectWithRetry();

// Export the Sequelize instance
module.exports = sequelize;