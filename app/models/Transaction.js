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
        model: User,
        key: 'user_id'
      }
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Book,
        key: 'book_id'
      }
    },
    transaction_type: {
      type: DataTypes.ENUM('RENTAL', 'PURCHASE'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    payment_reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Reference number from payment provider'
    },
    rental_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in days for rental transactions'
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'COMPLETED'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Set up associations
Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Book, { foreignKey: 'book_id' });

module.exports = Transaction;
