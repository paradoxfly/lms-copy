const logger = require('../utils/logger');

// Render the user dashboard
exports.dashboard = (req, res) => {
  try {
    // Ensure the user is authenticated and has the 'library_user' role
    if (!req.session.user || req.session.user.role !== 'library_user') {
      logger.warn(`Unauthorized access attempt to user dashboard by ${req.session.user?.username || 'Unknown user'}`);
      return res.status(403).json({ error: 'Access denied: Users only' });
    }

    // Render the user dashboard view
    res.render('userDashboard', {
      user: req.session.user,
      title: 'User Dashboard',
    });
  } catch (error) {
    logger.error(`Error rendering user dashboard: ${error.message}`);
    res.status(500).json({ error: 'Failed to load user dashboard' });
  }
};

// Add more user-specific controller methods here
// Example: View books, borrow books, etc.