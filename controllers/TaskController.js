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
        if (task.dataValues.technician_id !== req.body.technician_id) {
            throw Error('Specified technician id does not match our records. Please examine your request.')
        }
        if (task && task.dataValues.completed_at == null) {
            task.dataValues.completed_at = new Date();
            // Notification for Managers
            if (process.env.NODE_ENV !== "test") {
                sendNotification(task)
            }
            await task.save();
        } else if (task.dataValues.completed_at !== null) {
            throw Error('It appears you are trying to complete a task that has already been completed.')
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
        await Task.destroy({
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
        await Task.update({ summary: req.body.summary }, {
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

export const sendNotification = async (task) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const [technician, manager] = await Promise.all([
        User.findOne({ where: { id: task.dataValues.technician_id } }),
        User.findOne({ where: { role: 'manager' } })
    ]);
    const completed_at = task.dataValues.completed_at.toString();
    const toEmail = manager.dataValues.username;
    const msg = {
        to: toEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Task Completed',
        text: `A task with the description ${task.dataValues.summary} has been completed by ${technician.dataValues.username} at ${completed_at}`,
    };
    sgMail.send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
};