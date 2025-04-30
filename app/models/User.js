const { DataTypes } = require('sequelize');
const sequelize = require('../services/db'); // Import the Sequelize instance
const bcrypt = require('bcryptjs');

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
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    password_salt: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    password_reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
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
    role: {
        type: DataTypes.ENUM('admin', 'library_user'),
        allowNull: false,
        defaultValue: 'library_user',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'Users',
    timestamps: false,
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
            name: 'user_auth_idx',
            fields: ['username', 'password_hash']
        },
        {
            name: 'reset_token_idx',
            fields: ['password_reset_token']
        }
    ]
});

// Method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password_hash);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

module.exports = User;