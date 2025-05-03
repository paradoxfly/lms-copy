const { DataTypes } = require("sequelize");
const sequelize = require("../services/db");
const User = require("./User");
const Book = require("./Book");

const Like = sequelize.define(
  "Like",
  {
    like_id: {
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        name: 'like_unique_idx',
        unique: true,
        fields: ['user_id', 'book_id']
      }
    ]
  }
);

module.exports = Like; 