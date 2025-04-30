const express = require('express');
const { ensureAuthenticated, ensureUser } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// User dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('userDashboard', { user: req.session.user });
});

// User book views
router.get('/likes', ensureAuthenticated, (req, res) => {
  res.render('liked-books', { user: req.session.user });
});

router.get('/starred', ensureAuthenticated, (req, res) => {
  res.render('starred-books', { user: req.session.user });
});

router.get('/books', ensureAuthenticated, (req, res) => {
  res.render('my-books', { user: req.session.user });
});

router.get('/overdue', ensureAuthenticated, (req, res) => {
  res.render('overdueBook');
});

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