const Profile = require('../models/Profile');
const User = require('../models/User');
const Book = require('../models/Book');
const Like = require('../models/Like');
const Star = require('../models/Star');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const { profileUpdateLimiter, passwordChangeLimiter, validateProfileUpdate, validatePasswordChange } = require('../middlewares/securityMiddleware');

// Get user's public profile
exports.getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

        // Validate username format
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
            return res.status(400).json({ error: 'Invalid username format' });
        }

        // Find user with profile and related data
        const user = await User.findOne({
            where: { username },
            include: [
                {
                    model: Profile,
                    attributes: ['bio', 'profile_picture', 'reading_preferences', 'favorite_genres']
                },
                {
                    model: Book,
                    as: 'LikedBooks',
                    through: { model: Like, attributes: [] }
                },
                {
                    model: Book,
                    as: 'StarredBooks',
                    through: { model: Star, attributes: [] }
                },
                {
                    model: Book,
                    as: 'BorrowedBooks',
                    through: { model: Transaction, attributes: [] }
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Sanitize profile data before sending
        const profileData = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            bio: sanitizeHtml(user.Profile?.bio || ''),
            profile_picture: user.Profile?.profile_picture || null,
            reading_preferences: user.Profile?.reading_preferences || {},
            favorite_genres: user.Profile?.favorite_genres || [],
            liked_books: user.LikedBooks || [],
            starred_books: user.StarredBooks || [],
            borrowed_books: user.BorrowedBooks || []
        };

        res.json(profileData);
    } catch (error) {
        logger.error(`Error fetching public profile: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.session.user.id;
        const isOwnProfile = userId === req.session.user.id;

        // Validate user ID
        if (!/^\d+$/.test(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).render('error', {
                error: { status: 404 },
                message: 'User not found'
            });
        }

        // Get user's reading activity
        const [likedBooks, starredBooks, borrowedBooks] = await Promise.all([
            Like.findAll({
                where: { user_id: userId },
                include: [{ model: Book }]
            }),
            Star.findAll({
                where: { user_id: userId },
                include: [{ model: Book }]
            }),
            Transaction.findAll({
                where: { 
                    user_id: userId,
                    transaction_type: 'rental'
                },
                include: [{ model: Book }],
                order: [['rental_start_date', 'DESC']]
            })
        ]);

        // Calculate reading statistics
        const readingStats = {
            totalBooksRead: borrowedBooks.length,
            booksReadThisMonth: borrowedBooks.filter(tx => {
                const borrowedDate = new Date(tx.rental_start_date);
                const thisMonth = new Date();
                return borrowedDate.getMonth() === thisMonth.getMonth() &&
                       borrowedDate.getFullYear() === thisMonth.getFullYear();
            }).length,
            favoriteGenres: calculateFavoriteGenres([...likedBooks, ...starredBooks].map(item => item.Book))
        };

        // Sanitize data before rendering
        res.render('profile', {
            user: {
                ...user.toJSON(),
                bio: sanitizeHtml(user.bio || '')
            },
            isOwnProfile,
            profile: {
                bio: sanitizeHtml(user.bio || ''),
                profile_picture: user.profile_picture,
                liked_books: likedBooks.map(like => like.Book),
                starred_books: starredBooks.map(star => star.Book),
                borrowed_books: borrowedBooks.map(tx => ({
                    ...tx.Book.dataValues,
                    borrowed_at: tx.rental_start_date,
                    returned_at: tx.returned_at,
                    due_date: tx.rental_expiry
                })),
                reading_preferences: user.reading_preferences || {},
                favorite_genres: readingStats.favoriteGenres,
                stats: readingStats
            }
        });
    } catch (error) {
        logger.error(`Error fetching user profile: ${error.message}`);
        res.status(500).render('error', {
            error: { status: 500 },
            message: 'Error loading profile'
        });
    }
};

// Update user's profile
exports.updateProfile = [profileUpdateLimiter, validateProfileUpdate, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const {
            bio,
            reading_preferences,
            favorite_genres
        } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Handle profile picture upload
        if (req.file) {
            // Process and optimize image
            const processedImage = await sharp(req.file.buffer)
                .resize(500, 500, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            user.profile_picture = processedImage;
        }

        // Update user information
        await user.update({
            bio: bio ? sanitizeHtml(bio) : user.bio,
            reading_preferences: reading_preferences || user.reading_preferences,
            favorite_genres: favorite_genres || user.favorite_genres
        });

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                reading_preferences: user.reading_preferences,
                favorite_genres: user.favorite_genres
            }
        });
    } catch (error) {
        logger.error(`Error updating user profile: ${error.message}`);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}];

// Change password
exports.changePassword = [passwordChangeLimiter, validatePasswordChange, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await user.update({ password: hashedPassword });

        // Invalidate all sessions for this user
        req.session.destroy();

        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error) {
        logger.error(`Error changing password: ${error.message}`);
        res.status(500).json({ error: 'Failed to change password' });
    }
}];

// Get user's borrowing history
exports.getBorrowingHistory = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 50) {
            return res.status(400).json({ error: 'Invalid pagination parameters' });
        }

        const { count, rows: transactions } = await Transaction.findAndCountAll({
            where: { 
                user_id: userId,
                transaction_type: 'rental'
            },
            include: [{ model: Book }],
            order: [['rental_start_date', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            transactions: transactions.map(tx => ({
                id: tx.id,
                book: {
                    id: tx.Book.id,
                    title: sanitizeHtml(tx.Book.title),
                    author: sanitizeHtml(tx.Book.author),
                    image: tx.Book.image
                },
                borrowed_at: tx.rental_start_date,
                returned_at: tx.returned_at,
                due_date: tx.rental_expiry,
                late_fee: tx.late_fee,
                status: tx.returned_at ? 'returned' : 
                        new Date() > new Date(tx.rental_expiry) ? 'overdue' : 'active'
            })),
            pagination: {
                current_page: page,
                total_pages: totalPages,
                total_items: count,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        });
    } catch (error) {
        logger.error(`Error fetching borrowing history: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch borrowing history' });
    }
};

// Helper function to calculate favorite genres
function calculateFavoriteGenres(books) {
    const genreCounts = books.reduce((acc, book) => {
        if (book.genre) {
            acc[book.genre] = (acc[book.genre] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre]) => sanitizeHtml(genre));
} 