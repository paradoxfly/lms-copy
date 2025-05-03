const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");
const Like = require('./Like');
const User = require('./User');

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
      allowNull: false
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    about_author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cover_image: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('cover_image');
        if (Buffer.isBuffer(rawValue)) {
          return rawValue;
        }
        return rawValue || '/images/default-book-cover.jpg';
      }
    },
    isbn: {
      type: DataTypes.STRING(255),
      allowNull: false
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
      allowNull: false
    },
    no_of_copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    no_of_copies_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Path to the e-book file'
    },
    file_format: {
      type: DataTypes.ENUM('PDF', 'EPUB', 'MOBI'),
      allowNull: true,
      defaultValue: 'PDF'
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Size of the e-book file in bytes'
    },
    rental_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Price for renting the book'
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Price for purchasing lifetime access'
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: 'book_search_idx',
        type: 'FULLTEXT',
        fields: ['title', 'author', 'genre']
      },
      {
        name: 'book_isbn_idx',
        unique: true,
        fields: ['isbn']
      },
      {
        name: 'book_inventory_idx',
        fields: ['no_of_copies', 'no_of_copies_available']
      },
      {
        name: 'book_publication_idx',
        fields: ['publishing_company', 'year_of_publication']
      }
    ]
  }
);

module.exports = Book;
