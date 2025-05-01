const bcrypt = require('bcryptjs');
const { query } = require('../services/db');
const rateLimit = require('express-rate-limit'); // For rate limiting
const logger = require('../utils/logger'); // Custom logger for logging errors
const User = require('../models/User');
const { Sequelize } = require('sequelize');

// Rate limiter for login endpoints to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
});

exports.register = async (req, res) => {
    const { username, email, password, first_name, last_name } = req.body;

    try {
        // Input validation
        if (!username || !email || !password || !first_name || !last_name) {
            return res.status(400).json({
                error: 'All fields are required',
                field: 'form'
            });
        }

        // Check for existing username
        const existingUsername = await User.findOne({
            where: { username }
        });

        if (existingUsername) {
            logger.warn(`Registration attempt failed: Username '${username}' already exists`);
            return res.status(400).json({ 
                error: 'Username already exists',
                field: 'username'
            });
        }

        // Check for existing email
        const existingEmail = await User.findOne({
            where: { email }
        });

        if (existingEmail) {
            logger.warn(`Registration attempt failed: Email '${email}' already exists`);
            return res.status(400).json({ 
                error: 'Email already exists',
                field: 'email'
            });
        }

        // Create a new user (password will be hashed by the User model hook)
        const newUser = await User.create({
            username,
            email,
            first_name,
            last_name,
            password, // Pass the plain password, it will be hashed by the model hook
            role: 'user'
        });

        // Log the successful registration
        logger.info(`User registered: ${newUser.username}`);

        // Set session
        req.session.user = {
            id: newUser.user_id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        };

        // Send success response
        res.status(201).json({ 
            message: 'User registered successfully',
            redirect: '/user/dashboard'
        });
    } catch (error) {
        // Log the error
        logger.error(`Error registering user: ${error.message}`);

        // Handle validation errors
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).json({ 
                error: 'Validation error',
                details: error.errors.map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        // Send error response
        res.status(500).json({ error: 'Failed to register user' });
    }
}

// Admin Login Logic
exports.adminLogin = [loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the admin user
        const user = await User.findOne({
            where: {
                username: username,
                role: 'admin'
            }
        });

        if (!user) {
            logger.warn(`Admin login attempt failed: Admin not found for username ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            logger.warn(`Admin login attempt failed: Invalid credentials for username ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Set session
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        req.session.cookie.expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

        logger.info(`Admin login successful for username ${username}`);
        res.redirect('/admin/dashboard');

    } catch (error) {
        logger.error(`Admin login failed: ${error.message}`);
        res.status(500).json({ error: 'Admin login failed' });
    }
}];

// User Login Logic
exports.userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({
            where: {
                email: email,
            }
        });

        if (!user) {
            logger.warn(`Login attempt failed: User not found for email ${email}`);
            return res.status(401).json({ 
                error: 'Invalid email or password',
                field: 'email'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            logger.warn(`Login attempt failed: Invalid password for email ${email}`);
            return res.status(401).json({ 
                error: 'Invalid email or password',
                field: 'password'
            });
        }

        // Set session
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        // Set session expiration
        req.session.cookie.expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        logger.info(`User login successful: ${user.username}`);

        // Send success response with redirect URL
        res.status(200).json({ 
            success: true,
            redirect: '/user/dashboard',
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ 
            error: 'Login failed. Please try again.',
            field: 'email'
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            logger.error('❌ Logout failed:', err); // Use a proper logger
            return res.status(500).json({ error: 'Failed to log out. Please try again.' });
        }

        // Clear the session cookie
        res.clearCookie('connect.sid', {
            path: '/', // Ensure the cookie path matches the one used in session setup
            httpOnly: true, // Ensure the cookie is HTTP-only
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Prevent CSRF attacks
        });

        // Redirect based on user role (optional)
        const redirectUrl = req.session?.user?.role === 'admin' ? '/auth/admin-login' : '/auth/login';
        res.redirect(redirectUrl);
    });
};
