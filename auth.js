import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv'
dotenv.config()

// Define a secret key for signing and verifying JWTs
const secretKey = process.env.JWT; 

// Middleware function for authenticating requests
function authenticateToken(req, res, next) {
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
function generateToken(user) {
  // Set the expiration time to 1 hour from now
  const expiresIn = 60 * 60;

  // Generate the JWT using the secret key
  return jwt.sign(user, secretKey, { expiresIn });
}

export default { authenticateToken, generateToken };
