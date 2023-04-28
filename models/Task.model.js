import { DataTypes } from 'sequelize';
import { database as db } from '../database.js';
import User from './User.model.js';

const Task = db.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    summary: {
        type: DataTypes.STRING(2500),
        allowNull: false
    },
    // incomplete tasks will not have a completed_at date
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    timestamps: true,
});

Task.belongsTo(User, { as: 'technician', foreignKey: 'technician_id' });

export default Task;