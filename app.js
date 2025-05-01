const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const logger = require('./utils/logger');
const { securityHeaders, sessionConfig, validateFileUpload } = require('./middlewares/securityMiddleware');

const app = express();

// Apply security headers
app.use(securityHeaders);

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: validateFileUpload
});

// Session configuration
app.use(session(sessionConfig));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'app/views'));

// Routes
const bookRoutes = require('./app/routes/bookRoutes');
const userRoutes = require('./app/routes/userRoutes');
const authRoutes = require('./app/routes/authRoutes');

app.use('/books', bookRoutes);
app.use('/user', userRoutes);
app.use('/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 