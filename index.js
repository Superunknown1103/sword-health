import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { login } from './controllers/AuthController.js';
import { getAllTasks, createTask, completeTask } from './controllers/TaskController.js';

// Create an Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

// generate a token
app.post('/login', login);
// retrieve all tasks
app.get('/tasks/getAllTasks', getAllTasks);
// make a task
app.post('/tasks/createTask', createTask);
// complete a task
app.put('/tasks/completeTask', completeTask);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sword Health Api is listening on port ${PORT}`);
});