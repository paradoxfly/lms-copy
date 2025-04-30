const logger = require("../utils/logger");
const Book = require("../models/Book");
const { parseBook } = require("../utils/parseData");

const createBook = async (req, res) => {
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

    // Validate required fields
    if (!title || !author || !about_author || !description || !image || !isbn || 
        !publishing_company || !year_of_publication || !number_of_pages || !genre || !no_of_copies) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "All fields are required" 
      });
    }

    // Convert image from base64 to buffer
    let imageBuffer;
    try {
      imageBuffer = Buffer.from(image, 'base64');
    } catch (error) {
      logger.error(`Error converting image: ${error.message}`);
      return res.status(400).json({ 
        error: "Invalid image format",
        details: "The image must be in base64 format"
      });
    }

    // Convert numeric fields
    const yearNum = parseInt(year_of_publication);
    const pagesNum = parseInt(number_of_pages);
    const copiesNum = parseInt(no_of_copies);

    if (isNaN(yearNum) || isNaN(pagesNum) || isNaN(copiesNum)) {
      return res.status(400).json({ 
        error: "Invalid numeric fields",
        details: "Year, pages and copies must be valid numbers"
      });
    }

    const newBook = await Book.create({
      title,
      author,
      description,
      about_author,
      cover_image: imageBuffer,
      isbn,
      publishing_company,
      year_of_publication: yearNum,
      number_of_pages: pagesNum,
      genre,
      no_of_copies: copiesNum,
      no_of_copies_available: copiesNum,
      file_format: 'PDF', // Default values for optional fields
      created_at: new Date(),
    });

    logger.info(`Book created successfully: ${newBook.title}`);
    res.status(201).json({ 
      message: "Book created successfully", 
      book: {
        book_id: newBook.book_id,
        title: newBook.title,
        author: newBook.author
      }
    });
  } catch (error) {
    logger.error(`Error creating book: ${error.message}`);
    res.status(500).json({ 
      error: "Failed to create book",
      details: error.message 
    });
  }
};

// Get all books with their details
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['created_at', 'DESC']] // Most recent first
    });

    const booksWithDetails = await Promise.all(books.map(async (book) => {
      const parsedBook = await parseBook(book);
      return {
        id: book.book_id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        available_copies: book.no_of_copies_available,
        total_copies: book.no_of_copies,
        year_of_publication: book.year_of_publication,
        number_of_pages: book.number_of_pages,
        status: book.no_of_copies_available > 0 ? 'Available' : 'Not Available',
        image: parsedBook.image
      };
    }));

    res.json(booksWithDetails);
  } catch (error) {
    logger.error(`Error fetching books: ${error.message}`);
    res.status(500).json({ 
      error: "Failed to fetch books",
      details: error.message 
    });
  }
};

// Render the upload book list page
const renderUploadBookList = (req, res) => {
    res.render('uploadBookList', {
        title: 'Upload Book List',
        user: req.user
    });
};

// Handle book list upload
const uploadBookList = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Parse the JSON file
        let bookList;
        try {
            bookList = JSON.parse(req.file.buffer.toString());
            if (!Array.isArray(bookList)) {
                throw new Error('Uploaded file must contain an array of books');
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON format' });
        }

        const results = {
            success: [],
            errors: []
        };

        // Process each book in the list
        for (const bookData of bookList) {
            try {
                // Validate required fields
                const requiredFields = ['title', 'author', 'description', 'isbn', 'genre', 'no_of_copies'];
                const missingFields = requiredFields.filter(field => !bookData[field]);
                
                if (missingFields.length > 0) {
                    results.errors.push({
                        isbn: bookData.isbn || 'Unknown',
                        error: `Missing required fields: ${missingFields.join(', ')}`
                    });
                    continue;
                }

                // Check if book with ISBN already exists
                const existingBook = await Book.findOne({ where: { isbn: bookData.isbn } });
                if (existingBook) {
                    results.errors.push({
                        isbn: bookData.isbn,
                        error: 'Book with this ISBN already exists'
                    });
                    continue;
                }

                // Create the book
                const book = await Book.create({
                    title: bookData.title,
                    author: bookData.author,
                    description: bookData.description,
                    about_author: bookData.about_author || `Author of ${bookData.title}`,
                    isbn: bookData.isbn,
                    publishing_company: bookData.publishing_company || 'Unknown',
                    year_of_publication: bookData.year_of_publication || new Date().getFullYear(),
                    number_of_pages: bookData.number_of_pages || 0,
                    genre: bookData.genre,
                    no_of_copies: bookData.no_of_copies || 1,
                    no_of_copies_available: bookData.no_of_copies || 1,
                    file_format: 'PDF',
                    created_at: new Date()
                });

                results.success.push({
                    isbn: book.isbn,
                    title: book.title
                });
            } catch (error) {
                results.errors.push({
                    isbn: bookData.isbn || 'Unknown',
                    error: error.message
                });
            }
        }

        // Return results with a 207 Multi-Status code if there are any errors
        const statusCode = results.errors.length > 0 ? 207 : 200;
        res.status(statusCode).json(results);
    } catch (error) {
        logger.error(`Error uploading book list: ${error.message}`);
        res.status(500).json({ 
            error: 'Failed to upload book list',
            details: error.message 
        });
    }
};

module.exports = {
    createBook,
    getAllBooks,
    renderUploadBookList,
    uploadBookList
};
