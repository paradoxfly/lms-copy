const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");
const User = require("./User");
const Book = require("./Book");

const UserBook = sequelize.define(
  "UserBook",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'book_id'
      }
    },
    access_type: {
      type: DataTypes.ENUM('RENTAL', 'PURCHASE'),
      allowNull: false,
      comment: 'Whether the book is rented or purchased'
    },
    rental_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Start date for rental period'
    },
    rental_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'End date for rental period'
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Amount paid for rental or purchase'
    },
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_accessed: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time the user accessed this book'
    },
    current_page: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Last page the user was reading'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the user can currently access this book'
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: 'user_book_unique_idx',
        unique: true,
        fields: ['user_id', 'book_id']
      },
      {
        name: 'rental_period_idx',
        fields: ['rental_start_date', 'rental_end_date', 'is_active']
      },
      {
        name: 'payment_idx',
        fields: ['payment_status', 'payment_date']
      }
    ]
  }
);

// Set up associations
UserBook.belongsTo(User, { foreignKey: 'user_id' });
UserBook.belongsTo(Book, { foreignKey: 'book_id' });

module.exports = UserBook; 