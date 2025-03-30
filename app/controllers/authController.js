const bcrypt = require('bcryptjs');
const { query } = require('../services/db');
const rateLimit = require('express-rate-limit'); // For rate limiting
const logger = require('../utils/logger'); // Custom logger for logging errors
const User = require('../models/User');

// Rate limiter for login endpoints to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
});

exports.adminLoginPage = (req, res) => {
    res.render('adminLogin', { title: 'Admin Login' });
};

exports.userLoginPage = (req, res) => {
    res.render('userLogin', { title: 'User Login' });
};

exports.registerPage = (req, res) => {
    res.render('register', { title: 'Register' });
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Create a new user using Sequelize
        const newUser = await User.create({
            username,
            email,
            password_hash: password, // Note: the hook will hash this
            role: 'library_user',
        });

        // Log the successful registration
        logger.info(`User registered: ${newUser.username}`);

        // Send success response
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        // Log the error
        logger.error(`Error registering user: ${error.message}`);

        // Send error response
        res.status(500).json({ error: 'Failed to register user' });
    }
}

// Admin Login Logic
exports.adminLogin = [loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM Users WHERE username = ? AND role = "admin"';

    try {
        const users = await query(sql, [username]);
        const user = users[0];

        // Check if admin user exists
        if (!user) {
            logger.warn(`Admin login attempt failed: Admin not found for username ${username}`);
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Compare provided password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            logger.warn(`Admin login attempt failed: Invalid credentials for username ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session with user data and expiry
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + 60 * 60 * 1000); // 1-hour session expiry
        req.session.cookie.secure = true; // Ensure cookies are only sent over HTTPS

        logger.info(`Admin login successful for username ${username}`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        logger.error(`Admin login failed: ${error.message}`);
        res.status(500).json({ error: 'Admin login failed' });
    }
}];

// User Login Logic
exports.userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user
        const user = await User.findOne({
            where: {
                username: username,
                role: 'library_user'
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Invalid username or password' });
        }

    

        // Set session
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        // Instead of sending JSON response, redirect directly to dashboard
        res.redirect('/user/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
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