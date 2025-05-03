const { DataTypes } = require('sequelize');
const sequelize = require('../services/db'); // Import the Sequelize instance
const bcrypt = require('bcryptjs');
const Like = require('./Like');
const Book = require('./Book');

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 50],
        },
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50],
        },
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 50],
        },
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true,
            len: [5, 100],
        },
    },
    password: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    password_reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'username_unique_idx',
            unique: true,
            fields: ['username']
        },
        {
            name: 'email_unique_idx',
            unique: true,
            fields: ['email']
        },
        {
            name: 'reset_token_idx',
            fields: ['password_reset_token']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

module.exports = User;