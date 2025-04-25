const Profile = require('../models/Profile');
const User = require('../models/User');
const Book = require('../models/Book');
const Like = require('../models/Like');
const Star = require('../models/Star');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

// Get user's public profile
exports.getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;

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

        // Format the response
        const profileData = {
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            bio: user.Profile?.bio || '',
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

// Update user's profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { bio, reading_preferences, favorite_genres } = req.body;

        // Handle profile picture upload if present
        let profile_picture = null;
        if (req.file) {
            profile_picture = `/uploads/profiles/${req.file.filename}`;
        }

        // Update or create profile
        const [profile, created] = await Profile.findOrCreate({
            where: { user_id: userId },
            defaults: {
                bio,
                profile_picture,
                reading_preferences,
                favorite_genres
            }
        });

        if (!created) {
            await profile.update({
                bio,
                profile_picture: profile_picture || profile.profile_picture,
                reading_preferences,
                favorite_genres
            });
        }

        res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        logger.error(`Error updating profile: ${error.message}`);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Get user's reading history
exports.getReadingHistory = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const history = await Transaction.findAll({
            where: { user_id: userId },
            include: [{
                model: Book,
                attributes: ['book_id', 'title', 'author', 'image']
            }],
            order: [['transaction_date', 'DESC']]
        });

        res.json(history);
    } catch (error) {
        logger.error(`Error fetching reading history: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch reading history' });
    }
}; 