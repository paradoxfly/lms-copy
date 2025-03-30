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
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50],
        },
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
        },
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
        unique: true,
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
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(user.password_hash, saltRounds);
                user.password_hash = hashedPassword;
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(user.password_hash, saltRounds);
                user.password_hash = hashedPassword;
            }
        },
    },
});

User.prototype.comparePassword = async function (candidatePassword) {
    try {
        
        const isMatch = await bcrypt.compare(candidatePassword, this.password_hash);
        console.log('Password match result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

module.exports = User;