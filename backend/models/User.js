const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[\+]?[0-9\-\s\(\)]{9,15}$/
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500] // Max 500 characters for bio
    }
  },
  topics: {
    type: DataTypes.JSON, // Array of strings
    allowNull: true,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Topics must be an array');
        }
        if (value.length > 10) {
          throw new Error('Maximum 10 topics allowed');
        }
      }
    }
  },
  profilePicture: {
    type: DataTypes.STRING, // File path for uploaded images
    allowNull: true
  },
  debatesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2), // e.g., 4.85
    defaultValue: 5.0,
    allowNull: false,
    validate: {
      min: 1.0,
      max: 5.0
    }
  }
}, {
  tableName: 'users',
  timestamps: true, // Adds createdAt and updatedAt
  indexes: [
    {
      unique: true,
      fields: ['phoneNumber']
    }
  ]
});

// Instance methods
User.prototype.getStats = function() {
  return {
    debatesCount: this.debatesCount,
    rating: parseFloat(this.rating)
  };
};

User.prototype.updateStats = async function(newDebatesCount, newRating) {
  this.debatesCount = newDebatesCount;
  this.rating = newRating;
  await this.save();
};

module.exports = User;