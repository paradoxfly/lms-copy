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
      defaultValue: 0.00
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    rental_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    rental_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected return date'
    },
    actual_return_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Actual date when book was returned'
    },
    late_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Late fee if book is returned after due date'
    },
    late_fee_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'EXPIRED', 'CANCELLED', 'COMPLETED', 'OVERDUE'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about the transaction'
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: 'transaction_user_idx',
        fields: ['user_id']
      },
      {
        name: 'transaction_book_idx',
        fields: ['book_id']
      },
      {
        name: 'transaction_status_idx',
        fields: ['status']
      },
      {
        name: 'transaction_dates_idx',
        fields: ['rental_start_date', 'rental_end_date', 'actual_return_date']
      }
    ]
  }
);

// Set up associations
Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Book, { foreignKey: 'book_id' });

module.exports = Transaction;
