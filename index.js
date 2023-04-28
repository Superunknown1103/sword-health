import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { database, createDatabase } from './database.js';
import { seedDatabase } from './seed.js';
import models from './models/index.js';
import { login } from './controllers/AuthController.js';

// create the database
(async () => {
    await createDatabase();
    await database.sync({ force: true });
    await seedDatabase(database.getQueryInterface(), database);
})();

// Create an Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

// generate a token
app.post('/login', login);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sword Health Api is listening on port ${PORT}`);
});