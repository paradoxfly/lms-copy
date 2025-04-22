const logger = require("../utils/logger");
const Book = require("../models/Book");
const Like = require("../models/Like");
const Star = require("../models/Star");
const { Op } = require("sequelize");
const { parseBook } = require("../utils/parseData");
const Transaction = require("../models/Transaction");
const sequelize = require("../services/db");

// Render the user dashboard
exports.dashboard = (req, res) => {
  try {
    // Ensure the user is authenticated and has the 'library_user' role
    if (!req.session.user || req.session.user.role !== "library_user") {
      logger.warn(
        `Unauthorized access attempt to user dashboard by ${
          req.session.user?.username || "Unknown user"
        }`
      );
      return res.status(403).json({ error: "Access denied: Users only" });
    }

    // Render the user dashboard view
    res.render("userDashboard", {
      user: req.session.user,
      title: "User Dashboard",
    });
  } catch (error) {
    logger.error(`Error rendering user dashboard: ${error.message}`);
    res.status(500).json({ error: "Failed to load user dashboard" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;

    const existingLike = await Like.findOne({
      where: { user_id: userId, book_id: bookId },
    });

    if (existingLike) {
      await existingLike.destroy();
      res.json({ message: "Book unliked successfully", liked: false });
    } else {
      await Like.create({ user_id: userId, book_id: bookId });
      res.json({ message: "Book liked successfully", liked: true });
    }
  } catch (error) {
    logger.error(`Error toggling like: ${error.message}`);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;

    const existingStar = await Star.findOne({
      where: { user_id: userId, book_id: bookId },
    });

    if (existingStar) {
      await existingStar.destroy();
      res.json({ message: "Book unstarred successfully", starred: false });
    } else {
      await Star.create({ user_id: userId, book_id: bookId });
      res.json({ message: "Book starred successfully", starred: true });
    }
  } catch (error) {
    logger.error(`Error toggling star: ${error.message}`);
    res.status(500).json({ error: "Failed to toggle star" });
  }
};

exports.getLikedBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const likes = await Like.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Book,
          required: true,
          on: {
            book_id: { [Op.col]: "Like.book_id" },
          },
        },
      ],
    });

    const books = await Promise.all(likes.map((like) => parseBook(like.Book)));

    const booksWithImage = [];

    for (const book of books) {
      const starred = await Star.findOne({
        where: { user_id: userId, book_id: book.book_id },
      });

      booksWithImage.push({
        ...book,
        isLiked: true,
        isStarred: !!starred,
      });
    }

    res.json(booksWithImage);
  } catch (error) {
    logger.error(`Error fetching liked books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch liked books" });
  }
};

exports.getStarredBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const stars = await Star.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Book,
          required: true,
          on: {
            book_id: { [Op.col]: "Star.book_id" },
          },
        },
      ],
    });

    const books = await Promise.all(stars.map((star) => parseBook(star.Book)));

    const booksWithImage = [];

    for (const book of books) {
      const liked = await Like.findOne({
        where: { user_id: userId, book_id: book.book_id },
      });

      booksWithImage.push({
        ...book,
        isLiked: !!liked,
        isStarred: true,
      });
    }

    res.json(booksWithImage);
  } catch (error) {
    logger.error(`Error fetching starred books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch starred books" });
  }
};

exports.borrowBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.session.user.id;

    // Get the book and check availability
    const book = await Book.findByPk(bookId);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.no_of_copies_available <= 0) {
      return res.status(400).json({ error: "Book is currently unavailable" });
    }

    const existingTransaction = await Transaction.findOne({
      where: { user_id: userId, book_id: bookId },
    });

    if (existingTransaction) {
      return res
        .status(400)
        .json({ error: "You have already borrowed this book" });
    }

    // Create transaction and update book copies in a transaction
    await sequelize.transaction(async (t) => {
      // Create borrow transaction
      await Transaction.create(
        {
          user_id: userId,
          book_id: bookId,
          transaction_type: "rental",
          rental_expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
        { transaction: t }
      );

      // Update available copies
      await book.update(
        {
          no_of_copies_available: book.no_of_copies_available - 1,
        },
        { transaction: t }
      );
    });

    res.json({
      message: "Book borrowed successfully",
      availableCopies: book.no_of_copies_available - 1,
    });
  } catch (error) {
    logger.error(`Error borrowing book: ${error.message}`);
    res.status(500).json({ error: "Failed to borrow book" });
  }
};

exports.getBorrowedBooks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const transactions = await Transaction.findAll({
      where: { user_id: userId, transaction_type: "rental" },
    });

    const books = await Promise.all(
      transactions.map(async (transaction) => {
        const book = await Book.findByPk(transaction.book_id);
        return parseBook(book);
      })
    );

    res.json(books.map((book) => ({ ...book, isBorrowed: true })));
  } catch (error) {
    logger.error(`Error fetching borrowed books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch borrowed books" });
  }
};

// Add more user-specific controller methods here
// Example: View books, borrow books, etc.
