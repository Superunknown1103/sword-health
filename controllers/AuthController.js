import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv'
dotenv.config()
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import User from '../models/User.model.js';

// Define a secret key for signing and verifying JWTs
const secretKey = process.env.JWT;

// Middleware function for authenticating requests
export function authenticateToken(req, res, next) {
    // Get the JWT from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // If there is no token, return an HTTP 401 Unauthorized error
    if (!token) {
        return res.sendStatus(401);
    }

    // Verify the token using the secret key
    jwt.verify(token, secretKey, (err, user) => {
        // If the token is invalid, return an HTTP 403 Forbidden error
        if (err) {
            return res.sendStatus(403);
        }

        // Set the user object on the request for use in other middleware functions
        req.user = user;

        // Call the next middleware function
        next();
    });
}

// Function for generating a JWT for a given user
export function generateToken(user) {
    // Set the expiration time to 1 hour from now
    const expiresIn = 60 * 60;

    // Generate the JWT using the secret key
    return jwt.sign({ user }, secretKey, { expiresIn });
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({
            where: {
                username: username
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log(password, user.password, isValidPassword);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ user: user.id, role: user.role }, process.env.JWT);
        return res.json({ token })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}