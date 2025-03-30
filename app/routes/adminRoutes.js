const express = require('express');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Admin dashboard route
router.get('/admin-dashboard', ensureAuthenticated, ensureAdmin, adminController.dashboard);

module.exports = router;