const upload = require('../utils/multer');
const { admin, db } = require('../utils/firebaseAdminConfig');
const User = require('../models/userModel');
const cloudinary = require('../utils/cloudinary');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  const { email, password, username } = req.body;
  const imageFile = req.file; // Optional image, based on the frontend submission

  // Ensure email, password, and username are provided
  if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required.' });
  }

  // Email validation regex
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
  if (!validateEmail(email)) {
      return res.status(400).json({ message: 'The email address is improperly formatted.' });
  }

  try {
      // Check if the email already exists in MongoDB
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
          return res.status(400).json({ message: 'The email address is already in use by another account.' });
      }

      // Create a new Firebase user
      const userRecord = await admin.auth().createUser({
          email: email.trim().toLowerCase(),
          password,
          displayName: username,
      });

      // Generate email verification link for the user
      const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email.trim().toLowerCase());

      // Prepare image URL (if the image is provided by the user)
      let imageUrl = '';
      if (imageFile) {
          const uploadResponse = await cloudinary.uploader.upload(imageFile.path, { folder: 'user_images' });
          imageUrl = uploadResponse.secure_url;
      }

      // Save user details in MongoDB
      const newUser = new User({
          email: email.trim().toLowerCase(),
          username,
          firebaseUid: userRecord.uid,
          imageUrl, // Optional field; will be empty if no image is uploaded
      });
      await newUser.save();

      // Save user details in Firestore
      await db.collection('users').doc(userRecord.uid).set({
          email: email.trim().toLowerCase(),
          username,
          firebaseUid: userRecord.uid,
          imageUrl, // Optional field; will be empty if no image is uploaded
      });

      // Respond with a success message
      res.status(201).json({
          message: 'User created successfully. Please verify your email.',
          user: userRecord,
          emailVerificationLink,
      });
  } catch (error) {
      // Handle errors and send error response
      res.status(400).json({ message: error.message });
  }
};

// Check if email exists in Firebase Authentication
exports.checkEmail = async (req, res) => {
  const { email } = req.params;

  try {
    // Check if user exists in Firebase Authentication
    const userRecord = await admin.auth().getUserByEmail(email.trim().toLowerCase());
    return res.status(200).json({ exists: true, uid: userRecord.uid });
  } catch (error) {
    // If the user doesn't exist in Firebase, return false
    if (error.code === 'auth/user-not-found') {
      return res.status(200).json({ exists: false });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a user by email from Firebase Authentication
exports.deleteUser = async (req, res) => {
  const { email } = req.params;

  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email.trim().toLowerCase());
    
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userRecord.uid);

    return res.status(200).json({ message: `User with email ${email} deleted successfully` });
  } catch (error) {
    // Handle errors (user not found or other issues)
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate the user using Firebase Authentication (get user details from Firebase)
    const userRecord = await admin.auth().getUserByEmail(email);

    // Fetch the user's information from Firestore using the Firebase UID
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    // Check if the user document exists
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found in Firestore' });
    }

    const user = userDoc.data();

    // Send the user information along with a success message
    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        username: user.username,
        email: user.email,
        status: user.status,  // Assuming status is a field in your user document
        avatarURL: user.avatarURL,  // Assuming avatarURL is a field in your user document
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Login failed' });
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

exports.getCurrentUser = async (req, res) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log("Received token:", token);  // Log received token

    // Verify the Firebase custom token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Decoded token:", decodedToken);  // Log decoded token

    const userId = decodedToken.uid;  // Get user ID from token

    // Fetch the user from Firestore by UID
    const userDoc = await db.collection('users').doc(userId).get();

    // Log the document retrieval result
    console.log("Firestore document data:", userDoc.exists ? userDoc.data() : 'No such document found');

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found in Firestore' });
    }

    // Get the user data from the document
    const user = userDoc.data();

    // Respond with user details
    res.status(200).json({
      message: 'User retrieved successfully',
      user: {
        username: user.username,
        email: user.email,
        status: user.status,  // Assuming status is a field in your user document
        avatarURL: user.avatarURL,  // Assuming avatarURL is a field in your user document
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};