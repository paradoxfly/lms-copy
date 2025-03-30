const express = require('express');
const { ensureAuthenticated, ensureUser } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// User dashboard route
router.get('/dashboard', ensureAuthenticated, ensureUser, userController.dashboard);

module.exports = router;