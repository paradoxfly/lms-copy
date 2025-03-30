const logger = require('../utils/logger');

// Ensure user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
    // Check if user is logged in and session is not expired
    if (req.session.user && req.session.cookie.expires > new Date()) {
        return next();  // User is authenticated
    }

    // Log unauthorized access attempts
    logger.warn(`Unauthorized access attempt to ${req.originalUrl} by ${req.ip}`);

    // Return a 401 Unauthorized response for APIs
    if (req.accepts('json')) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }

    // Redirect to login page for web applications
    res.redirect('/login');
};

// Ensure user is an admin
exports.ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    logger.warn(`Unauthorized admin access attempt by user ${req.session.user?.username}`);
    res.status(403).json({ error: 'Access denied: Admins only' });
};

// Ensure user is a regular user
exports.ensureUser = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'library_user') {
        return next();
    }
    logger.warn(`Unauthorized user access attempt by user ${req.session.user?.username}`);
    res.status(403).json({ error: 'Access denied: Users only' });
};