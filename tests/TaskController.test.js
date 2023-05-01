import { getAllTasks, createTask, completeTask, deleteTask } from '../controllers/TaskController.js';
import Task from '../models/Task.model.js';
describe('getAllTasks', () => {
    it('should return all tasks', async () => {
        const mockTasks = [{ id: 1, summary: 'Task 1' }, { id: 2, summary: 'Task 2' }];
        const mockReq = {};
        const mockRes = {
            json: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Task, 'findAll').mockResolvedValue(mockTasks);

        await getAllTasks(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({ tasks: mockTasks });
    });

    it('should handle errors', async () => {
        const mockReq = {};
        const mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        const mockError = new Error('An error occurred');
        jest.spyOn(Task, 'findAll').mockRejectedValue(mockError);

        await getAllTasks(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith('An error occurred while fetching tasks');
    });
});
describe('createTask', () => {
    let mockReq, mockRes, mockTask;

    beforeEach(() => {
        mockReq = {
            body: {
                summary: 'Test task summary',
                technician_id: 1
            }
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn(() => mockRes),
            send: jest.fn()
        };
        mockTask = {
            id: 1,
            summary: 'Test task summary',
            technician_id: 1,
            save: jest.fn()
        };
        jest.spyOn(Task, 'build').mockReturnValue(mockTask);
    });

    it('should create a new task and return it in the response', async () => {
        // Call the function with the mock request and response objects
        await createTask(mockReq, mockRes);

        // Assert that the Task model's "build" method was called with the correct arguments
        expect(Task.build).toHaveBeenCalledWith({
            summary: 'Test task summary',
            technician_id: 1
        });

        // Assert that the task's "save" method was called
        expect(mockTask.save).toHaveBeenCalled();

        // Assert that the response's "json" method was called with the correct argument
        expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return a 500 status if an error occurs', async () => {
        // Mock the Task model's "build" method to throw an error
        Task.build.mockImplementation(() => { throw new Error('Test error'); });

        // Call the function with the mock request and response objects
        await createTask(mockReq, mockRes);

        // Assert that the response's "status" method was called with 500
        expect(mockRes.status).toHaveBeenCalledWith(500);

        // Assert that the response's "send" method was called with the correct argument
        expect(mockRes.send).toHaveBeenCalledWith('An error occurred while creating task');
    });
});
describe('completeTask', () => {
    let mockReq, mockRes, taskMock;

    beforeEach(() => {
        mockReq = {
            body: {
                id: 1,
                technician_id: 1,
            },
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        taskMock = {
            dataValues: {
                id: 1,
                summary: 'Test task summary',
                technician_id: 1,
                completed_at: null,
            },
            save: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('completes a task and returns it in the response', async () => {
        // Mock the Task model's "findOne" method
        jest.spyOn(Task, 'findOne').mockResolvedValueOnce(taskMock);

        // Call the completeTask function with mock request and response objects
        const mockReq = { body: { id: 1, technician_id: 1 } };
        // const mockRes = { json: jest.fn() };
        await completeTask(mockReq, mockRes);

        // Assert that the Task model's "findOne" method was called with the correct arguments
        expect(Task.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

        // Assert that the task's "completed_at" property is no longer null
        expect(taskMock.dataValues.completed_at).not.toBe(null)

        // Assert that the task was saved
        expect(taskMock.save).toHaveBeenCalled();

        // Assert that the task was returned in the response
        expect(mockRes.json).toHaveBeenCalledWith({ task: taskMock });
    });

    it('returns an error if the specified technician id does not match', async () => {
        // Mock the Task model's "findOne" method
        jest.spyOn(Task, 'findOne').mockResolvedValueOnce(taskMock);
        taskMock.dataValues.technician_id = 8;

        // Call the completeTask function with mock request and response objects
        await completeTask(mockReq, mockRes);

        expect(Task.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

        // Assert that the function returned an error response
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith('An error occurred completing task: Error: Specified technician id does not match our records. Please examine your request.');
    });

    it('should throw an error if the task has already been completed', async () => {
        // Mock the Task model's "findOne" method
        let taskMockCompleted = taskMock;
        taskMockCompleted.dataValues.completed_at = Date.now();
        jest.spyOn(Task, 'findOne').mockResolvedValueOnce(taskMockCompleted);

        await completeTask(mockReq, mockRes);

        // Assert that the Task model's "findOne" method was called with the correct arguments
        expect(Task.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

        // Assert that the task's "completed_at" property is no longer null
        expect(taskMock.dataValues.completed_at).not.toBe(null)

        // Assert that the function returned an error response
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith('An error occurred completing task: Error: It appears you are trying to complete a task that has already been completed.');
    });
});
describe('deleteTask', () => {
    let mockReq, mockRes, taskMock;

    beforeEach(async () => {
        mockReq = {
            body: {
                summary: 'Test task summary',
                technician_id: 1
            }
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn(() => mockRes),
            send: jest.fn()
        };
        taskMock = {
            id: 1,
            summary: 'Test task summary',
            technician_id: 1,
        };
        jest.spyOn(Task, 'destroy').mockReturnValue(taskMock);
    });

    it('deletes a task and returns a success message', async () => {
        // Mock the destroy method of the Task model
        jest.spyOn(Task, 'findOne').mockResolvedValue(taskMock);
        // Call the deleteTask function
        await deleteTask(mockReq, mockRes);
        // Assert that the task was deleted
        expect(Task.destroy).toHaveBeenCalledWith({
            where: {
                id: mockReq.body.id,
            },
        });
        // Assert that a success message was returned
        expect(mockRes.json).toHaveBeenCalledWith({
            message: `Task ${mockReq.body.id} deleted successfully.`,
        });
    });

    // additional test can be made for when trying to delete a task that does not exist, should return a 500

})

// describe additional tests for getTasksByTechnicianId, updateTask and sendNotification perhaps