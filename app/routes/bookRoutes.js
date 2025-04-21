const express = require("express");
const bookController = require("../controllers/bookController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", ensureAuthenticated, bookController.getAllBooks);

module.exports = router;
