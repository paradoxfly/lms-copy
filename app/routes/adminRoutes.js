const express = require("express");
const { ensureAdminAuthenticated, ensureAdmin } = require("../middlewares/authMiddleware");
const adminController = require("../controllers/adminController");
const { validateBookCreation } = require("../middlewares/validationMiddleware");
const router = express.Router();

// Admin dashboard route
router.post(
  "/create-book",
  ensureAdminAuthenticated,
  validateBookCreation,
  adminController.createBook
);

module.exports = router;