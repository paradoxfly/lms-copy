const express = require('express');
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validationMiddleware');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// Login routes
router.post('/login', authController.userLogin);
router.post('/admin-login', authController.adminLogin);

// Registration routes
router.post('/register', validateRegistration, authController.register);

// Logout route
router.post('/logout',ensureAuthenticated, authController.logout);

module.exports = router;