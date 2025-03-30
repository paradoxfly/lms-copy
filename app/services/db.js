require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create a Sequelize instance
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE, // Database name
    process.env.MYSQL_ROOT_USER, // Database user
    process.env.MYSQL_ROOT_PASSWORD, // Database password
    {
        host: process.env.DB_CONTAINER, // Database host
        port: process.env.DB_PORT, // Database port
        dialect: 'mysql', // Database dialect
        pool: {
            max: 10, // Maximum number of connections in the pool
            min: 0, // Minimum number of connections in the pool
            acquire: 30000, // Maximum time (in milliseconds) that a connection can be idle before being released
            idle: 10000, // Maximum time (in milliseconds) that a connection can be idle before being released
        },
        logging: false, // Disable logging for production
    }
);

// Test the database connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
})();

module.exports = sequelize;