const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
    level: 'info', // Log only messages with level 'info' and above
    format: winston.format.combine(
        winston.format.timestamp(), // Add a timestamp to each log
        winston.format.json() // Log in JSON format
    ),
    transports: [
        // Log errors to a separate file
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        // Log all messages to a combined file
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(), // Simple format for console output
    }));
}

module.exports = logger;