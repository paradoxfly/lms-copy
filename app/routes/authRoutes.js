const express = require('express');
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validationMiddleware');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// Login routes
router.get('/login', authController.userLoginPage);
router.post('/login', authController.userLogin);

// Registration routes
router.get('/register', authController.registerPage);
router.post('/register', validateRegistration, authController.register);

// Logout route
router.post('/logout',ensureAuthenticated, authController.logout);

module.exports = router;