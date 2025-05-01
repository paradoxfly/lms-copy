const express = require("express");
const bookController = require("../controllers/bookController");
const { ensureAuthenticated } = require("../middlewares/authMiddleware");
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/", ensureAuthenticated, bookController.getAllBooks);
router.get("/new-reads", bookController.getNewReads);

module.exports = router;
