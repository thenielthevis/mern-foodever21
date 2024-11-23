const express = require('express');
const protect = require('../middleware/protect');  // Assuming you have a middleware for protected routes

const {
    login,
    updateUser,
    resetPassword,
    uploadAvatar,
    getCurrentUser,
    signup,
    checkEmail,
    deleteUser,
    getAllUsers, // Import the getAllUsers function
} = require('../controllers/authController');

const router = express.Router();

// Routes
router.post('/signup', signup);
router.post('/login', login);
router.patch('/updateUser', protect, updateUser);
router.put('/updateUser', protect, updateUser);
router.post('/resetPassword', resetPassword);
router.post('/upload-avatar', uploadAvatar);
router.get('/me', protect, getCurrentUser);

// Add the new routes for checking email and deleting user
router.get('/check-email/:email', checkEmail);  // To check if email exists
router.delete('/delete-user/:email', deleteUser);  // To delete user by email

// Add the route for fetching all users
router.get('/users', protect, getAllUsers);

module.exports = router;
