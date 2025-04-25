const { DataTypes } = require('sequelize');
const sequelize = require('../services/db');
const User = require('./User');

const Profile = sequelize.define('Profile', {
    profile_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'user_id'
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    profile_picture: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    reading_preferences: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    favorite_genres: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'Profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Define associations
Profile.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Profile, { foreignKey: 'user_id' });

module.exports = Profile; 