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

// ... rest of your app.js code ... 