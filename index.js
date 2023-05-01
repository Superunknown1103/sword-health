import express from "express";
import bodyParser from "body-parser";
import { login, authenticate } from './controllers/AuthController.js';
import { getAllTasks, createTask, completeTask, getTasksbyTechnicianId, deleteTask, updateTask } from './controllers/TaskController.js';

// Create an Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// generate a token
app.post('/login', login);
// retrieve all tasks
app.get('/tasks/getAllTasks', authenticate('manager'), getAllTasks);
// make a task
app.post('/tasks/createTask', authenticate('all'), createTask);
// complete a task
app.patch('/tasks/completeTask', authenticate('all'), completeTask);
// view all tasks for a single technician
app.get(`/tasks/getTasksByTechnicianId`, authenticate('all'), getTasksbyTechnicianId);
// destroy task
app.delete('/tasks/deleteTask', authenticate('all'), deleteTask);
// update a task summary
app.put('/tasks/updateTask', authenticate('all'), updateTask);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sword Health Api is listening on port ${PORT}`);
});