const express = require("express");
const { ensureAdminAuthenticated, ensureAdmin } = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");
const { validateBookCreation } = require("../middlewares/validationMiddleware");
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Admin login route
router.get('/login', (req, res) => {
  res.render('admin-login');
});

// Admin dashboard route
router.get('/dashboard', ensureAdminAuthenticated, (req, res) => {
  res.render('admin-dashboard', { user: req.session.user });
});

// Book management routes
router.post(
  "/create-book",
  ensureAdminAuthenticated,
  validateBookCreation,
  adminController.createBook
);

router.get(
  "/books",
  ensureAdminAuthenticated,
  adminController.getAllBooks
);

// Book upload routes
router.get('/upload-book', ensureAdminAuthenticated, (req, res) => {
  res.render('uploadBook');
});

router.get('/upload-book-list', ensureAdminAuthenticated, (req, res) => {
  res.render('uploadBookList');
});

router.post('/upload-book-list', ensureAdminAuthenticated, upload.single('bookList'), adminController.uploadBookList);

router.get('/upload-successful', ensureAdminAuthenticated, (req, res) => {
  res.render('uploadSucessfull');
});

module.exports = router;