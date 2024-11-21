// module.exports = protect;

const { getAuth } = require('firebase-admin/auth');
const createError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    // Get the token from the headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new createError('You are not logged in! Please log in to get access.', 401));
    }

    const token = authHeader.split(' ')[1]; // Extract the token
    if (!token) {
      return next(new createError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify the token using Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(token);

    // Ensure the decoded token contains the necessary data
    if (!decodedToken || !decodedToken.uid) {
      return next(new createError('Invalid token: User not authenticated.', 401));
    }

    // Log the decoded token for debugging
    console.log('Decoded Token:', decodedToken);

    // Find the user in your database
    const currentUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!currentUser) {
      return next(new createError('The user belonging to this token does no longer exist.', 401));
    }

    // Log the authenticated user for debugging
    console.log('Authenticated User:', currentUser);

    // Attach the user object to the request for further use
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Error in protect middleware:', error.message);
    next(new createError('Invalid or expired token. Please log in again.', 401));
  }
};

module.exports = protect;