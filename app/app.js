// Import required modules
const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const logger = require("./utils/logger");
const { errorHandler } = require("./middlewares/errorMiddleware");
const {
  ensureAuthenticated,
  ensureAdminAuthenticated,
  ensureUser,
} = require("./middlewares/authMiddleware");
const { sessionConfig } = require("./middlewares/securityMiddleware");
const db = require("./services/db"); // Database connection
const initializeDatabase = require("./services/initDb");
dotenv.config(); // Load environment variables

// Create express app
const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Session setup
app.use(session(sessionConfig));

// Add static files location
app.use(express.static("public"));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Set the view engine to Pug
app.set("view engine", "pug");
app.set("views", "./app/views");

// Initialize database and start server
(async () => {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Main route - redirect to login
    app.get("/", (req, res) => {
      res.redirect("/login");
    });

    // Authentication routes
    app.get("/register", (req, res) => {
      res.render("signup");
    });

    app.get("/login", (req, res) => {
      res.render("login");
    });

    // Mount route modules
    app.use("/auth", require("./routes/authRoutes"));
    app.use("/admin", require("./routes/adminRoutes"));
    app.use("/user", require("./routes/userRoutes"));
    app.use("/books", require("./routes/bookRoutes"));

    // Error Handling Middleware
    app.use(errorHandler);

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      logger.info(`🚀 Server running at http://127.0.0.1:${PORT}/`)
    );
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
})();
