const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");
const User = require("./User");
const Book = require("./Book");

const Transaction = sequelize.define(
  "Transaction",
  {
    transaction_id: {
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
    transaction_type: {
      type: DataTypes.ENUM('purchase', 'rental'),
      allowNull: false,
    },
    rental_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transaction_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    timestamps: true,
    createdAt: "transaction_date",
    updatedAt: false,
  }
);

Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Book, { foreignKey: 'book_id' });

module.exports = Transaction;
