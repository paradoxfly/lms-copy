-- Clear existing data
DELETE FROM Transactions;
DELETE FROM UserBooks;
DELETE FROM Users WHERE role = 'library_user';
DELETE FROM Books;

-- Test data for bookorbit database

-- Users data (including the existing admin)
INSERT INTO Users (username, first_name, last_name, password_hash, email, role, created_at) VALUES
('john_reader_test', 'John', 'Doe', '$2b$10$8M7EpTujh7gVTdXfie0hBuiqERC7gwp.80OB6ff.W2DNTMGf0xvJi', 'john.reader.test@example.com', 'library_user', NOW()),
('jane_reader_test', 'Jane', 'Smith', '$2b$10$8M7EpTujh7gVTdXfie0hBuiqERC7gwp.80OB6ff.W2DNTMGf0xvJi', 'jane.reader.test@example.com', 'library_user', NOW()),
('bob_reader_test', 'Bob', 'Wilson', '$2b$10$8M7EpTujh7gVTdXfie0hBuiqERC7gwp.80OB6ff.W2DNTMGf0xvJi', 'bob.reader.test@example.com', 'library_user', NOW()),
('alice_reader_test', 'Alice', 'Brown', '$2b$10$8M7EpTujh7gVTdXfie0hBuiqERC7gwp.80OB6ff.W2DNTMGf0xvJi', 'alice.reader.test@example.com', 'library_user', NOW());

-- Books data
INSERT INTO Books (title, author, description, about_author, cover_image, isbn, publishing_company, year_of_publication, number_of_pages, genre, no_of_copies, no_of_copies_available, file_path, file_format, file_size, rental_price, purchase_price, created_at, updated_at) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'A story of decadence and excess.', 'American author F. Scott Fitzgerald is known for his novels depicting the Jazz Age.', '/images/default-book-cover.jpg', '9780743273565', 'Scribner', 1925, 180, 'Fiction', 5, 3, '/books/great-gatsby.pdf', 'PDF', 1024000, 4.99, 14.99, NOW(), NOW()),
('To Kill a Mockingbird', 'Harper Lee', 'A story of racial injustice and loss of innocence.', 'Harper Lee was an American novelist best known for this Pulitzer Prize-winning book.', '/images/default-book-cover.jpg', '9780446310789', 'Grand Central', 1960, 281, 'Fiction', 5, 4, '/books/mockingbird.pdf', 'PDF', 1536000, 5.99, 16.99, NOW(), NOW()),
('1984', 'George Orwell', 'A dystopian social science fiction novel.', 'George Orwell was an English novelist and essayist.', '/images/default-book-cover.jpg', '9780451524935', 'Signet Classic', 1949, 328, 'Science Fiction', 5, 5, '/books/1984.pdf', 'PDF', 1843000, 4.99, 15.99, NOW(), NOW()),
('Pride and Prejudice', 'Jane Austen', 'A romantic novel of manners.', 'Jane Austen was an English novelist known for her romantic fiction.', '/images/default-book-cover.jpg', '9780141439518', 'Penguin Classics', 1813, 432, 'Romance', 5, 2, '/books/pride.pdf', 'PDF', 2048000, 3.99, 12.99, NOW(), NOW()),
('The Hobbit', 'J.R.R. Tolkien', 'A fantasy novel about a hobbit''s journey.', 'J.R.R. Tolkien was an English writer and philologist.', '/images/default-book-cover.jpg', '9780547928227', 'Houghton Mifflin', 1937, 310, 'Fantasy', 5, 4, '/books/hobbit.pdf', 'PDF', 1638400, 5.99, 17.99, NOW(), NOW());

-- UserBooks data (borrowing/purchase records)
INSERT INTO UserBooks (user_id, book_id, access_type, rental_start_date, rental_end_date, amount_paid, payment_status, payment_date, last_accessed, current_page, is_active, created_at, updated_at) VALUES
((SELECT user_id FROM Users WHERE username = 'john_reader_test'), (SELECT book_id FROM Books WHERE title = 'The Great Gatsby'), 'RENTAL', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 4.99, 'COMPLETED', NOW(), NOW(), 45, true, NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'jane_reader_test'), (SELECT book_id FROM Books WHERE title = 'To Kill a Mockingbird'), 'PURCHASE', NOW(), NULL, 16.99, 'COMPLETED', NOW(), NOW(), 100, true, NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'bob_reader_test'), (SELECT book_id FROM Books WHERE title = '1984'), 'RENTAL', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 4.99, 'COMPLETED', NOW(), NOW(), 75, true, NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'alice_reader_test'), (SELECT book_id FROM Books WHERE title = 'Pride and Prejudice'), 'PURCHASE', NOW(), NULL, 12.99, 'COMPLETED', NOW(), NOW(), 150, true, NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'john_reader_test'), (SELECT book_id FROM Books WHERE title = 'The Hobbit'), 'RENTAL', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 5.99, 'COMPLETED', NOW(), NOW(), 200, true, NOW(), NOW());

-- Transactions data
INSERT INTO Transactions (user_id, book_id, transaction_type, amount, payment_method, payment_status, payment_reference, rental_duration, transaction_date, status, created_at, updated_at) VALUES
((SELECT user_id FROM Users WHERE username = 'john_reader_test'), (SELECT book_id FROM Books WHERE title = 'The Great Gatsby'), 'RENTAL', 4.99, 'CARD', 'COMPLETED', 'TRX-001', 30, NOW(), 'ACTIVE', NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'jane_reader_test'), (SELECT book_id FROM Books WHERE title = 'To Kill a Mockingbird'), 'PURCHASE', 16.99, 'CARD', 'COMPLETED', 'TRX-002', NULL, NOW(), 'COMPLETED', NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'bob_reader_test'), (SELECT book_id FROM Books WHERE title = '1984'), 'RENTAL', 4.99, 'CARD', 'COMPLETED', 'TRX-003', 30, NOW(), 'ACTIVE', NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'alice_reader_test'), (SELECT book_id FROM Books WHERE title = 'Pride and Prejudice'), 'PURCHASE', 12.99, 'CARD', 'COMPLETED', 'TRX-004', NULL, NOW(), 'COMPLETED', NOW(), NOW()),
((SELECT user_id FROM Users WHERE username = 'john_reader_test'), (SELECT book_id FROM Books WHERE title = 'The Hobbit'), 'RENTAL', 5.99, 'CARD', 'COMPLETED', 'TRX-005', 30, NOW(), 'ACTIVE', NOW(), NOW()); 