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

// Return route
router.post("/books/:bookId/return", ensureAuthenticated, userController.returnBook);

// Get borrowed books route
router.get("/borrowed-books", ensureAuthenticated, userController.getBorrowedBooks);

// Search routes
router.get("/books/search", (req, res) => {
  res.render('search-results', { 
    user: req.session.user,
    query: req.query.query || '',
    author: req.query.author || ''
  });
});

router.get("/books/:bookId", (req, res) => {
  res.render('book-details', { 
    user: req.session.user,
    bookId: req.params.bookId
  });
});

// API routes
router.get("/api/books/search", userController.searchBooks);
router.get("/api/books/:bookId", userController.getBookDetails);

// Profile routes
const profileController = require('../controllers/profileController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', ensureAuthenticated, profileController.getProfile);
router.get('/profile/:userId', ensureAuthenticated, profileController.getProfile);
router.put('/profile', ensureAuthenticated, upload.single('profile_picture'), profileController.updateProfile);
router.post('/profile/change-password', ensureAuthenticated, profileController.changePassword);
router.get('/profile/borrowing-history', ensureAuthenticated, profileController.getBorrowingHistory);

module.exports = router;