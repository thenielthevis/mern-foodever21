const express = require('express');
const protect = require('../middleware/protect');

const {
    login,
    updateUser,
    resetPassword,
    uploadAvatar,
    getCurrentUser,
    signup
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.patch('/updateUser', protect, updateUser);
router.put('/updateUser', protect, updateUser);
router.post('/resetPassword', resetPassword);
router.post('/upload-avatar', uploadAvatar);
router.get('/me', protect, getCurrentUser);

module.exports = router;