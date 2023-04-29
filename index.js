import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { login, authenticate } from './controllers/AuthController.js';
import { getAllTasks, createTask, completeTask } from './controllers/TaskController.js';

// Create an Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

// generate a token
app.post('/login', login);
// retrieve all tasks
app.get('/tasks/getAllTasks', authenticate('manager'), getAllTasks);
// make a task
app.post('/tasks/createTask', authenticate('all'), createTask);
// complete a task
app.put('/tasks/completeTask', authenticate('all'), completeTask);
// view my tasks (as a technician)
// app.get(`/technician/${}/tasks`)

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sword Health Api is listening on port ${PORT}`);
});