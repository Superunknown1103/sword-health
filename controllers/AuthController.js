import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv'
dotenv.config()
import bcrypt from 'bcrypt';
import User from '../models/User.model.js';

// Define a secret key for signing and verifying JWTs
const secretKey = process.env.JWT;

export const authenticate = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, secretKey);
    req.user = decodedToken.user;
    
    if (requiredRole == "manager" && decodedToken.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (requiredRole == "all" && decodedToken.role !== "manager" && req.body.technician_id !== decodedToken.user) { 
        return res.status(403).json({ message: 'You do not have sufficient privileges to perform this action.'})
    }

    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

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