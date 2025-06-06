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
const db = require("./services/db"); // Database connection
dotenv.config(); // Load environment variables

// Create express app
const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      maxAge: 60 * 60 * 1000, // 1-hour expiry
      sameSite: "strict", // Prevent CSRF attacks
    },
  })
);

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

// Test database connection
app.get("/db_test", async (req, res) => {
  try {
    const results = await db.query("SELECT * FROM test_table");
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("❌ Database test failed:", error);
    res.status(500).json({ error: "Database connection error" });
  }
});

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes")); // Admin-specific routes
app.use("/user", require("./routes/userRoutes")); // User-specific routes
app.use("/books", require("./routes/bookRoutes")); // Book-specific routes

app.get("/", function (req, res) {
  res.redirect("/login");
});

app.get("/register", function (req, res) {
  res.render("signup");
});
app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/overdueBook", function (req, res) {
  res.render("overdueBook");
});

app.get("/user/likes", ensureAuthenticated, (req, res) => {
  res.render("liked-books", { user: req.session.user });
});

app.get("/user/starred", ensureAuthenticated, (req, res) => {
  res.render("starred-books", { user: req.session.user });
});

app.get("/user/books", ensureAuthenticated, (req, res) => {
  res.render("my-books", { user: req.session.user });
});

// User Dashboard (Only accessible to Library Users)
app.get("/user/dashboard", ensureAuthenticated, (req, res) => {
  res.render("userDashboard", { user: req.session.user });
});

// General Views
app.get("/cover", (req, res) => res.render("cover"));

// Admin Dashboard (Only accessible to Admins)
app.get(
  "/admin/dashboard",
  ensureAdminAuthenticated,
  (req, res) => {
    res.render("admin-dashboard", { user: req.session.user });
  }
);
app.get(
  "/admin/upload-book",
  ensureAdminAuthenticated,
  function (req, res) {
    res.render("uploadBook");
  }
);
app.get(
  "/admin/upload-book-list",
  ensureAdminAuthenticated,
  function (req, res) {
    res.render("uploadBookList");
  }
);
app.get(
  "/admin/upload-successful",
  ensureAdminAuthenticated,
  function (req, res) {
    res.render("uploadSucessfull");
  }
);
app.get("/admin/login", function (req, res) {
  res.render("admin-login");
});

// Error Handling Middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://127.0.0.1:${PORT}/`)
);
