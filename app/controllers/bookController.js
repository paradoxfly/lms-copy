const logger = require("../utils/logger");
const Book = require("../models/Book");
const Like = require("../models/Like");
const Star = require("../models/Star");
const { parseBook } = require("../utils/parseData");
const { Op } = require("sequelize");

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

exports.getNewReads = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['created_at', 'DESC']],
      limit: 3
    });

    const userId = req.session?.user?.id;
    const booksWithImage = [];

    for (const book of books) {
      try {
        const parsedBook = await parseBook(book);
        
        // Check if user has liked/starred the book only if userId exists
        const [liked, starred] = userId ? await Promise.all([
          Like.findOne({
            where: { user_id: userId, book_id: book.book_id }
          }),
          Star.findOne({
            where: { user_id: userId, book_id: book.book_id }
          })
        ]) : [null, null];

        booksWithImage.push({
          ...parsedBook,
          isLiked: !!liked,
          isStarred: !!starred,
          no_of_copies_available: book.no_of_copies_available
        });
      } catch (parseError) {
        logger.error(`Error parsing book ${book.book_id}: ${parseError.message}`);
        // Continue with next book if one fails
        continue;
      }
    }
    
    if (booksWithImage.length === 0) {
      logger.warn('No books were successfully parsed for new reads');
      return res.status(404).json({ error: "No books found" });
    }
    
    res.json(booksWithImage);
  } catch (error) {
    logger.error(`Error fetching new reads: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch new reads" });
  }
};
