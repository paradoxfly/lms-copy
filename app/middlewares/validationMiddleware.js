const { body, validationResult } = require("express-validator");

exports.validateRegistration = [
  // Validation rules
  body("first_name")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters")
    .isAlpha()
    .withMessage("First name can only contain letters"),

  body("last_name")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters")
    .isAlpha()
    .withMessage("Last name can only contain letters"),

  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  // Error handling middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateBookCreation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("author").notEmpty().withMessage("Author is required"),
  body("about_author").notEmpty().withMessage("About author is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("image").notEmpty().isBase64().withMessage("Image is required"),
  body("isbn").notEmpty().withMessage("ISBN is required"),
  body("publishing_company")
    .notEmpty()
    .withMessage("Publishing company is required"),
  body("year_of_publication")
    .notEmpty()
    .withMessage("Year of publication is required"),
  body("number_of_pages").notEmpty().withMessage("Number of pages is required"),
  body("genre").notEmpty().withMessage("Genre is required"),
  body("no_of_copies").notEmpty().withMessage("Number of copies is required"),

  // Error handling middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
