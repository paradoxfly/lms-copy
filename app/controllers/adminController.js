const logger = require('../utils/logger');

// Render the admin dashboard
exports.dashboard = (req, res) => {
  try {
    // Ensure the user is authenticated and has the 'admin' role
    if (!req.session.user || req.session.user.role !== 'admin') {
      logger.warn(`Unauthorized access attempt to admin dashboard by ${req.session.user?.username || 'Unknown user'}`);
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    // Render the admin dashboard view
    res.render('adminDashboard', {
      user: req.session.user,
      title: 'Admin Dashboard',
    });
  } catch (error) {
    logger.error(`Error rendering admin dashboard: ${error.message}`);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
};

// Add more admin-specific controller methods here
// Example: Manage users, manage books, etc.