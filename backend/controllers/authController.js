const upload = require('../utils/multer');
const { admin, db } = require('../utils/firebaseAdminConfig');
const User = require('../models/userModel');
const cloudinary = require('../utils/cloudinary');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = [
  upload.single('image'),
  async (req, res) => {
    const { email, password, username } = req.body;
    const imageFile = req.file;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required.' });
    }

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'The email address is improperly formatted.' });
    }

    try {
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'The email address is already in use by another account.' });
      }
      const existingFirebaseUser = await admin.auth().getUserByEmail(email.trim().toLowerCase());
      if (existingFirebaseUser) {
        return res.status(400).json({ message: 'The email address is already in use by another account.' });
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        return res.status(400).json({ message: error.message });
      }
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: email.trim().toLowerCase(),
        password,
        displayName: username,
      });
      const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email.trim().toLowerCase());
      let imageUrl = '';
      if (imageFile) {
        const uploadResponse = await cloudinary.uploader.upload(imageFile.path, { folder: 'user_images' });
        imageUrl = uploadResponse.secure_url;
      }
      const newUser = new User({
        email: email.trim().toLowerCase(),
        username,
        firebaseUid: userRecord.uid,
        imageUrl,
      });
      await newUser.save();
      await db.collection('users').doc(userRecord.uid).set({
        email: email.trim().toLowerCase(),
        username,
        firebaseUid: userRecord.uid,
        imageUrl,
      });
      res.status(201).json({ message: 'User created successfully. Please verify your email.', user: userRecord, emailVerificationLink });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
];

// Controller function to handle user login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Ensure the password and email are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Log the user document to debug password issue
    console.log('User found:', user);

    // Check if the password field exists in the user document
    if (!user.password) {
      return res.status(400).json({ message: 'Password is missing in the user document' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await(password, user.password);
    // const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token if authentication is successful
    const token = jwt.sign(
      { uid: user.firebaseUid, email: user.email, role: user.role }, // Payload
      process.env.JWT_SECRET, // Secret key from your environment variables
      { expiresIn: '1h' } // Set token expiration
    );

    // Respond with the user details and JWT token
    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        userImage: user.userImage,
      },
      token: token, // Send the generated token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Controller function to handle user update
exports.updateUser = async (req, res) => {
  const { email, password, username } = req.body;
  const userId = req.user.uid; // Assuming user ID is available in req.user

  try {
    // Check if password is provided, if not, don't update it
    let updateData = { email, displayName: username };
    if (password) {
      // Hash the new password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user details in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: userId },
      updateData,
      { new: true }
    );

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller function to handle password reset
exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    res.status(200).json({ message: 'Password reset email sent. Please check your inbox.', link });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Controller function to handle avatar upload
exports.uploadAvatar = [
  upload.single('image'),
  async (req, res) => {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    try {
      const uploadResponse = await cloudinary.uploader.upload(imageFile.path, { folder: 'user_images' });
      const imageUrl = uploadResponse.secure_url;

      // Update the user record in the database with the new image URL
      const updatedUser = await User.findOneAndUpdate(
        { firebaseUid: req.user.uid },
        { userImage: imageUrl },
        { new: true }
      );

      res.status(201).json({
        message: 'Image uploaded successfully',
        secure_url: imageUrl,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error during image upload:", error.message);
      res.status(400).json({ message: error.message });
    }
  }
];

// Controller function to get the currently logged-in user
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.uid; // Assuming user is attached to req.user by protect middleware

    const user = await User.findOne({ firebaseUid: userId });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        userImage: user.userImage,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(400).json({ message: 'Failed to fetch user details' });
  }
};
