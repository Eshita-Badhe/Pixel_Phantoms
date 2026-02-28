const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            // Allow letters, apostrophes, hyphens, spaces
            // supports names like O'Saki or Van-Helsing
            is: /^[\p{L}][\p{L}'\- ]{0,29}$/u
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            is: /^[\p{L}][\p{L}'\- ]{0,29}$/u
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true
        }
    }
}, {
    timestamps: true,
    getterMethods: {
        // Dynamically calculate age from dateOfBirth whenever user.age is accessed
        age() {
            if (!this.dateOfBirth) return null;
            const diffMs = Date.now() - new Date(this.dateOfBirth).getTime();
            const ageDt = new Date(diffMs);
            return Math.abs(ageDt.getUTCFullYear() - 1970);
        }
    }
});

module.exports = User;
