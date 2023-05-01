import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv'
dotenv.config()
import bcrypt from 'bcrypt';
import User from '../models/User.model.js';

// Define a secret key for signing and verifying JWTs
export const secretKey = process.env.JWT;

// middleware authenticator function
export const authenticate = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, secretKey);
    req.user = decodedToken.user;

    // check that the role of the current user matches the role necessary to proceed with this action
    if (requiredRole == "manager" && decodedToken.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // check that the technician id matches the id of the user that is trying to perform this action (unless they have manager privileges)
    if (requiredRole == "all" && decodedToken.role !== "manager" && req.body.technician_id !== decodedToken.user) { 
        return res.status(403).json({ message: 'You do not have sufficient privileges to perform this action.'})
    }

    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

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