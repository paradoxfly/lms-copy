const express = require('express');
const { ensureAuthenticated, ensureUser } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const Book = require('../models/Book');

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

// Recently borrowed books (last 30 days, rentals only)
router.get('/borrowed-books', ensureAuthenticated, userController.getRecentlyBorrowedBooks);

// Book routes
router.get("/books/new-reads", userController.getNewReads);

// Move the search route here, before /books/:bookId
router.get('/books/search', ensureAuthenticated, userController.searchBooks);

router.get("/api/books/:bookId", userController.getBookDetails);
router.get("/books/:bookId", (req, res) => {
  res.render('book-details', { 
    user: req.session.user,
    bookId: req.params.bookId
  });
});

// Profile routes
const profileController = require('../controllers/profileController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', ensureAuthenticated, profileController.getProfile);
router.get('/profile/:userId', ensureAuthenticated, profileController.getProfile);
router.put('/profile', ensureAuthenticated, upload.single('profile_picture'), profileController.updateProfile);
router.post('/profile/change-password', ensureAuthenticated, profileController.changePassword);
router.get('/profile/borrowing-history', ensureAuthenticated, profileController.getBorrowingHistory);

// Debug route - remove in production
router.get("/debug/books", async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json({
      count: books.length,
      books: books.map(book => ({
        id: book.book_id,
        title: book.title,
        author: book.author
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New POST route for buying a book
router.post("/books/:bookId/buy", ensureAuthenticated, userController.buyBook);

router.get('/settings', ensureAuthenticated, userController.getSettingsPage);
router.get('/profile', ensureAuthenticated, userController.getProfile);
router.post('/profile/update', ensureAuthenticated, userController.updateProfile);
router.post('/profile/password', ensureAuthenticated, userController.updatePassword);
router.delete('/profile', ensureAuthenticated, userController.deleteAccount);
router.post('/logout', ensureAuthenticated, userController.logout);

// Render search results page
router.get('/search-results', ensureAuthenticated, (req, res) => {
  res.render('searchResult', {
    user: req.session.user,
    query: req.query.query || '',
    filters: req.query.filter || []
  });
});

// Currently reading books (active rentals + purchases)
router.get('/currently-reading', ensureAuthenticated, userController.getCurrentlyReadingBooks);

// Pending returns (active or overdue rentals)
router.get('/pending-returns', ensureAuthenticated, userController.getPendingReturns);

// Pick of the week (top 5 books by new likes last week)
router.get('/pick-of-the-week', ensureAuthenticated, userController.getPickOfTheWeek);

// Popular books (ranked by star count, supports limit and pagination)
router.get('/popular-books', ensureAuthenticated, userController.getPopularBooks);

// Popular books list
router.get('/popular-books-list', ensureAuthenticated, (req, res) => {
  res.render('popular-books', { user: req.session.user });
});

module.exports = router;