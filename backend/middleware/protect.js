// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
// const createError = require('../utils/appError');

// const protect = async (req, res, next) => {
//     try {
//         // Get token from headers
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith('Bearer ')) {
//             return next(new createError('You are not logged in! Please log in to get access.', 401));
//         }

//         const token = authHeader.split(' ')[1];
//         if (!token) {
//             return next(new createError('You are not logged in! Please log in to get access.', 401));
//         }

//         // Verify token
//         const decoded = jwt.verify(token, 'secretkey123');

//         // Check if user still exists
//         const currentUser = await User.findById(decoded.id);
//         if (!currentUser) {
//             return next(new createError('The user belonging to this token does no longer exist.', 401));
//         }

//         // Log the current user for debugging
//         console.log('Authenticated user:', currentUser);

//         // Grant access to protected route
//         req.user = currentUser;
//         next();
//     } catch (error) {
//         next(error);
//     }
// };

// module.exports = protect;

const { getAuth } = require('firebase-admin/auth');
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
    const decodedToken = await getAuth().verifyIdToken(token);

    // Check if user still exists in your database
    const currentUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!currentUser) {
      return next(new createError('The user belonging to this token does no longer exist.', 401));
    }

    // Log the current user for debugging
    console.log('Authenticated user:', currentUser);

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = protect;