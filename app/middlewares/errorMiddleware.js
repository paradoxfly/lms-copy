// middlewares/errorMiddleware.js
const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message });
};