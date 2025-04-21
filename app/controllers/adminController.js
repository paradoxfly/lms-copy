const logger = require("../utils/logger");
const Book = require("../models/Book");

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      about_author,
      description,
      image,
      isbn,
      publishing_company,
      year_of_publication,
      number_of_pages,
      genre,
      no_of_copies,
    } = req.body;

    const imageBuffer = Buffer.from(image, 'base64');

    const newBook = await Book.create({
      title,
      author,
      description,
      about_author,
      image: imageBuffer,
      isbn,
      publishing_company,
      year_of_publication,
      number_of_pages,
      genre,
      no_of_copies,
      no_of_copies_available: no_of_copies,
      created_at: new Date(),
    });

    logger.info(`Book created: ${newBook.title}`);
    res.status(201).json({ message: "Book created successfully", book: newBook });
  } catch (error) {
    logger.error(`Error creating book: ${error.message}`);
    res.status(500).json({ error: "Failed to create book" });
  }
};
