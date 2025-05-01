const logger = require("../utils/logger");

// Ensure user is authenticated
exports.ensureAuthenticated = (req, res, next) => {
  // Check if user is logged in and session is not expired
  if (
    req.session.user &&
    req.session.cookie.expires > new Date() &&
    ["user", "admin"].includes(req.session.user.role)
  ) {
    return next(); // User is authenticated
  }

  // Log unauthorized access attempts
  logger.warn(`Unauthorized access attempt to ${req.originalUrl} by ${req.ip}`);

  // Redirect to login page for web applications
  res.redirect("/login");
};

// Ensure admin is authenticated
exports.ensureAdminAuthenticated = (req, res, next) => {
  // Check if user is logged in and session is not expired
  if (
    req.session.user &&
    req.session.cookie.expires > new Date() &&
    req.session.user.role === "admin"
  ) {
    return next(); // User is authenticated
  }

  // Log unauthorized access attempts
  logger.warn(`Unauthorized access attempt to ${req.originalUrl} by ${req.ip}`);

  res.redirect("/admin/login");
};

// Ensure user is a regular user
exports.ensureUser = (req, res, next) => {
  if (
    req.session.user &&
    req.session.user.role === "user"
  ) {
    return next();
  }
  logger.warn(
    `Unauthorized user access attempt by user ${req.session.user?.username}`
  );
  res.status(403).json({ error: "Access denied: Users only" });
};
