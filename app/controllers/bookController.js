const logger = require("../utils/logger");
const Book = require("../models/Book");
const Like = require("../models/Like");
const Star = require("../models/Star");
const { parseBook } = require("../utils/parseData");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();

    const userId = req.session.user.id;

    const booksWithImage = [];

    for (const book of books) {
      const parsedBook = await parseBook(book);
      
      // Check if user has liked/starred the book
      const liked = await Like.findOne({
        where: { user_id: userId, book_id: book.book_id }
      });
      
      const starred = await Star.findOne({
        where: { user_id: userId, book_id: book.book_id }
      });

      booksWithImage.push({
        ...parsedBook,
        isLiked: !!liked,
        isStarred: !!starred,
        no_of_copies_available: book.no_of_copies_available
      });
    }
    
    res.json(booksWithImage);
  } catch (error) {
    logger.error(`Error fetching books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};
