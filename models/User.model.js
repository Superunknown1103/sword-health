import { DataTypes } from 'sequelize';
import { database as db } from '../database.js';

const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('technician', 'manager'),
        allowNull: false
    },
}, {
    timestamps: true
});

export default User;