import { authenticate, secretKey, login } from '../controllers/AuthController.js';
import User from '../models/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv'
dotenv.config()

describe('authenticate method', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {}, body: {} };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 401 if authorization header is missing', () => {
        authenticate('all')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing' });
    });

    it('should return 403 if required role is manager and user role is not manager', () => {
        const token = jwt.sign({ user: '123', role: 'technician' }, secretKey);
        req.headers.authorization = `Bearer ${token}`;

        authenticate('manager')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should call next if required role is all and user is a manager', () => {
        const token = jwt.sign({ user: '123', role: 'manager' }, secretKey);
        req.headers.authorization = `Bearer ${token}`;

        authenticate('all')(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should call next if required role is all and user is a technician with matching id', () => {
        const token = jwt.sign({ user: '123', role: 'technician' }, secretKey);
        req.headers.authorization = `Bearer ${token}`;
        req.body.technician_id = '123';

        authenticate('all')(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('should return 403 if required role is all and user is a technician without matching id', () => {
        const token = jwt.sign({ user: '123', role: 'technician' }, secretKey);
        req.headers.authorization = `Bearer ${token}`;
        req.body.technician_id = '456';

        authenticate('all')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'You do not have sufficient privileges to perform this action.' });
    });

    it('should return 401 if token is invalid', () => {
        const token = 'invalid-token';
        req.headers.authorization = `Bearer ${token}`;

        authenticate('all')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });
});

describe('login method', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            body: {
                username: 'testuser',
                password: 'testpassword'
            }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    test('should return a JWT for a valid user', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: '$2b$10$SPPwS2Lz/4oeKj7o4yG9LO1B4tT.ydCIJnxCHvT.6jW8r.viA0sEi', // hashed password for 'testpassword'
            role: 'technician'
        };
        User.findOne = jest.fn().mockResolvedValue(mockUser);
        bcrypt.compare = jest.fn().mockResolvedValue(true);

        await login(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should return a 401 error for an invalid user', async () => {
        User.findOne = jest.fn().mockResolvedValue(null);

        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
    });

    test('should return a 401 error for an invalid password', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: '$2b$10$SPPwS2Lz/4oeKj7o4yG9LO1B4tT.ydCIJnxCHvT.6jW8r.viA0sEi', // hashed password for 'testpassword'
            role: 'technician'
        };
        User.findOne = jest.fn().mockResolvedValue(mockUser);
        bcrypt.compare = jest.fn().mockResolvedValue(false);

        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
    });

    test('should return a 500 error for an internal server error', async () => {
        User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

        await login(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
});


