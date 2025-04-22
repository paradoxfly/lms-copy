const express = require('express');
const { ensureAuthenticated, ensureUser } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// User dashboard route
// router.get('/dashboard', ensureAuthenticated, ensureUser, userController.dashboard);

// Like/Unlike routes
router.post("/books/:bookId/like", ensureAuthenticated, userController.toggleLike);
router.get("/liked-books", ensureAuthenticated, userController.getLikedBooks);

// Star/Unstar routes
router.post("/books/:bookId/star", ensureAuthenticated, userController.toggleStar);
router.get("/starred-books", ensureAuthenticated, userController.getStarredBooks);

// Borrow route
router.post("/books/:bookId/borrow", ensureAuthenticated, userController.borrowBook);

// Get borrowed books route
router.get("/borrowed-books", ensureAuthenticated, userController.getBorrowedBooks);

module.exports = router;