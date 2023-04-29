import Task from '../models/Task.model.js';
import User from '../models/User.model.js';
import sgMail from '@sendgrid/mail';

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
        const task = await Task.findOne({
            where: {
                id: req.body.id,
            }
        });
        if (task.technician_id !== req.body.technician_id) {
            throw Error('Specified technician id does not match our records. Please examine your request.')
        }
        if (task && task.completed_at == null) {
            task.completed_at = new Date();
            // Notification for Managers
            sendNotification(task)
            await task.save();
        }
        res.json({ task });
    } catch (err) {
        console.error('Error creating task: ', err);
        res.status(500).send(`An error occurred completing task: ${err}`);
    }
};

export const getTasksbyTechnicianId = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: {
                technician_id: req.body.technician_id
            }
        });
        res.json({ tasks });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('An error occurred while fetching tasks');
    }
}

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.destroy({
            where: {
                id: req.body.id
            }
        });
        res.json({ "message": `Task ${req.body.id} deleted successfully.` })
    } catch (err) {
        console.error('Error deleting task: ', err);
        res.status(500).send('An error occurred while deleting task');
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.update({ summary: req.body.summary }, {
            where: {
                id: req.body.id,
            }
        });
        res.json({ "message": `Task ${req.body.id} summary has been updated.` })
    } catch (err) {
        console.error('Error updating task: ', err);
        res.status(500).send('An error occurred updating task');
    }
}

export const sendNotification = async (taskDetails) => {
    const completed_at = taskDetails.dataValues.completed_at.toString();
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const technician = await User.findOne({
        where: {
            id: taskDetails.dataValues.technician_id
        }
    })
    await User.findOne({
        where: {
            role: 'manager'
        }
    })
        .then((result) => {
            const toEmail = result.dataValues.username;
            const msg = {
                to: toEmail,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: 'Task Completed',
                text: `A task with the description ${taskDetails.dataValues.summary} has been completed by ${technician.dataValues.username} at ${completed_at}`,
            };
            sgMail.send(msg)
                .then(() => {
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                })
        })
};