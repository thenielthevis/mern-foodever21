const jwt = require('jsonwebtoken'); // JWT in case you're using it for custom tokens
const User = require('../models/userModel'); // MongoDB User model
const { admin } = require('../utils/firebaseAdminConfig'); // Firebase Admin SDK
const createError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return next(new createError('You are not logged in! Please log in to get access.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('Token is missing');
      return next(new createError('You are not logged in! Please log in to get access.', 401));
    }

    // Log the encoded token
    console.log('Encoded Token:', token);

    // Verify token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded Token UID:', decodedToken.uid); // Log the decoded UID

    // Fetch the user from MongoDB using the firebaseUid
    const user = await User.findOne({ firebaseUid: decodedToken.uid }); // Query MongoDB
    if (!user) {
      console.error('No user found with the given UID in MongoDB');
      return next(new createError('The user belonging to this token does no longer exist.', 401));
    }

    // Log the user for debugging
    console.log('Authenticated User:', user);

    // Attach the user (including role) to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error);
    return next(new createError('You are not logged in! Please log in to get access.', 401));
  }
};

module.exports = protect;
