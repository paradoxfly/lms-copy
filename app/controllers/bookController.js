const logger = require("../utils/logger");
const Book = require("../models/Book");
const { fileTypeFromBuffer } = require("file-type");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();

    const booksWithImage = [];

    for (const book of books) {
        const parsedBook = await parseBook(book);
        booksWithImage.push(parsedBook);
    }
    res.json(booksWithImage);
  } catch (error) {
    logger.error(`Error fetching books: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

async function parseBook(book) {
    const fileType = await fileTypeFromBuffer(book.image);
    const base64Image = book.image.toString("base64");
    const image = `data:${fileType.mime};base64,${base64Image}`;
    return { ...book.dataValues, image };
}