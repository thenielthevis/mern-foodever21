const { admin, db } = require('../utils/firebaseAdminConfig'); // Use Firestore here
const createError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new createError('You are not logged in! Please log in to get access.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new createError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded Token UID:', decodedToken.uid);  // Log the decoded UID
    
    // Query Firestore for the user with the UID
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return next(new createError('The user belonging to this token does no longer exist.', 401));
    }
    
    const currentUser = userDoc.data();
    console.log('Authenticated user:', currentUser);  // Log the current user for debugging
    
    // Attach the user to the request object for use in subsequent routes
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);  // Pass the error to the error-handling middleware
  }
};

module.exports = protect;
