const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        validate: {
            min: 1
        }
    },
    registeredCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    registrationOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

/*
 * Safe registration method using transaction + row lock
 */
Event.registerUser = async function (eventId) {
    return await sequelize.transaction(async (t) => {

        const event = await Event.findByPk(eventId, {
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!event) {
            throw new Error('Event not found');
        }

        if (!event.registrationOpen) {
            throw new Error('Registration is closed');
        }

        if (event.registeredCount >= event.capacity) {
            throw new Error('Event is full');
        }

        event.registeredCount += 1;
        await event.save({ transaction: t });

        return event;
    });
};

module.exports = Event;
