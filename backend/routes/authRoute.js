const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middleware/protect');

const router = express.Router();

//router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.patch('/updateUser', protect, authController.updateUser);
router.put('/updateUser', protect, authController.updateUser); // Add this line to support PUT requests
router.post('/resetPassword', authController.resetPassword);
router.post('/upload-avatar', authController.uploadAvatar);



module.exports = router;