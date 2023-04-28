import * as dotenv from 'dotenv'
dotenv.config()
import { Sequelize } from 'sequelize';

const databaseName = "sword_health_sql";

export const createDatabase = async () => {
    // Initialize the Sequelize instance
    const sequelize = new Sequelize(`mysql://root:${process.env.DB_PASS}@localhost:3306`);
    // Create the database
    return sequelize.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
}

export const database = new Sequelize('sword_health_sql', 'root', process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    password: process.env.DB_PASS
});

