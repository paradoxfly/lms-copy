const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");

const Book = sequelize.define(
  "Book",
  {
    book_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.BLOB('medium'),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    publishing_company: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    year_of_publication: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number_of_pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    no_of_copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    no_of_copies_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    about_author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true, // enable timestamps
    createdAt: "created_at", // map to your custom field
    updatedAt: false, // or map it too if you plan to use it
  }
);

module.exports = Book;
