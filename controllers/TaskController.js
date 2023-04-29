import Task from '../models/Task.model.js';

export const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.json({ tasks });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('An error occurred while fetching tasks');
    }
};

export const createTask = async (req, res) => {
    try {
        const task = Task.build(req.body);
        await task.save();
        console.log(`A new task with an id ${task.id} has been created and assigned to technician_id ${task.technician_id}`);
        res.json({ task });
    } catch (err) {
        console.error('Error creating task: ', err);
        res.status(500).send('An error occurred while creating task');
    }
};

export const completeTask = async (req, res) => {
    try {
        console.log(req.body);
        const task = await Task.findOne({ where: { id: req.body.id } });
        console.log(task);
        if (task) {
            task.completed_at = new Date();
            await task.save();
        }
        res.json({ task });
    } catch (err) {
        console.error('Error creating task: ', err);
        res.status(500).send('An error occurred completing task');
    }
};