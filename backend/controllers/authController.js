// const upload = require('../utils/multer'); // Correctly import multer from utils/multer
// const { admin, db } = require('../utils/firebaseAdminConfig');
// const User = require('../models/userModel');
// const cloudinary = require('../utils/cloudinary'); // Import Cloudinary config

// exports.signup = [
//   upload.single('image'), // Expect a single file upload with field name "image"
//   async (req, res) => {
//     console.log("Received signup request with data:", req.body);

//     const { email, password, username } = req.body;
//     const imageFile = req.file; // Access the uploaded file (if any)

//     // Check if required fields are provided
//     if (!email || !password || !username) {
//       console.log("Missing required fields. Email:", email, "Password:", password, "Username:", username);
//       return res.status(400).json({ message: 'Email, password, and username are required.' });
//     }

//     // Validate email format
//     const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
//     if (!validateEmail(email)) {
//       console.log("Invalid email format:", email);
//       return res.status(400).json({ message: 'The email address is improperly formatted.' });
//     }

//     try {
//       // Check if user already exists
//       const existingUser = await admin.auth().getUserByEmail(email.trim().toLowerCase());
//       if (existingUser) {
//         console.log("User already exists with email:", email);
//         return res.status(400).json({ message: 'The email address is already in use by another account.' });
//       }
//     } catch (error) {
//       if (error.code !== 'auth/user-not-found') {
//         console.error("Error checking existing user. Email:", email, "Error:", error.message);
//         return res.status(400).json({ message: error.message });
//       }
//     }

//     try {
//       // Create a new user in Firebase Authentication
//       const userRecord = await admin.auth().createUser({
//         email: email.trim().toLowerCase(),
//         password,
//         displayName: username,
//       });
//       console.log("User created in Firebase Authentication:", userRecord);

//       // Generate email verification link
//       const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email.trim().toLowerCase());
//       console.log("Email verification link generated:", emailVerificationLink);

//       // Optionally, send the verification email using a custom email service
//       // await sendCustomVerificationEmail(email.trim().toLowerCase(), emailVerificationLink);

//       // Upload image to Cloudinary (if provided)
//       let imageUrl = '';
//       if (imageFile) {
//         const uploadResponse = await cloudinary.uploader.upload(imageFile.path, { folder: 'user_images' });
//         imageUrl = uploadResponse.secure_url;
//         console.log("Image uploaded to Cloudinary:", imageUrl);
//       }

//       // Save user data to MongoDB
//       const newUser = new User({
//         email: email.trim().toLowerCase(),
//         username,
//         firebaseUid: userRecord.uid,
//         imageUrl, // Save the image URL if provided
//       });
//       await newUser.save();
//       console.log("User data saved to MongoDB:", newUser);

//       // Save user data to Firestore
//       await db.collection('users').doc(userRecord.uid).set({
//         email: email.trim().toLowerCase(),
//         username,
//         firebaseUid: userRecord.uid,
//         imageUrl,
//       });
//       console.log("User data saved to Firestore");

//       // Respond with success message and user details
//       res.status(201).json({ message: 'User created successfully. Please verify your email.', user: userRecord, emailVerificationLink });
//     } catch (error) {
//       console.error("Error during signup. Email:", email, "Error:", error.message);
//       res.status(400).json({ message: error.message });
//     }
//   }
// ];
const upload = require('../utils/multer');
const { admin, db } = require('../utils/firebaseAdminConfig');
const User = require('../models/userModel');
const cloudinary = require('../utils/cloudinary');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  const { username, email, password, firebaseUid, role, status, userImage, cloudinary_id } = req.body;

  try {
      // Hash the password before saving to MongoDB
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user document
      const newUser = new User({
          username,
          email,
          password: hashedPassword, // Save the hashed password
          firebaseUid,
          role: role || 'user',
          status: status || 'active',
          userImage,
          cloudinary_id,
      });

      await newUser.save();
      res.status(201).json({ message: 'User registered successfully in MongoDB.' });
  } catch (error) {
      console.error('Error saving user to MongoDB:', error.message);
      res.status(500).json({ message: 'Internal server error', error: error.message });
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
    // Update user details in Firebase Authentication
    const userRecord = await admin.auth().updateUser(userId, {
      email,
      password,
      displayName: username,
    });
    // Respond with success message and updated user details
    res.status(200).json({ message: 'User updated successfully', user: userRecord });
  } catch (error) {
    // Respond with error message if user update fails
    res.status(400).json({ message: error.message });
  }
};

// Controller function to handle password reset
exports.resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Generate a password reset link for the given email
    const link = await admin.auth().generatePasswordResetLink(email);
    // Send the link to the user's email address
    // You can use a service like SendGrid, Mailgun, etc. to send the email
    res.status(200).json({ message: 'Password reset email sent. Please check your inbox.', link });
  } catch (error) {
    // Respond with error message if password reset fails
    res.status(400).json({ message: error.message });
  }
};

exports.uploadAvatar = [
  upload.single('image'),
  async (req, res) => {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    try {
      // Upload image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(imageFile.path, { folder: 'user_images' });
      const imageUrl = uploadResponse.secure_url;

      res.status(201).json({ message: 'Image uploaded successfully', secure_url: imageUrl });
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

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach the decoded user to the request
    next();
  } catch (error) {
    console.error('Error verifying ID token:', error.message);
    return res.status(403).json({ message: 'Failed to verify token', error: error.message });
  }
};

exports.getUserData = async (req, res) => {
  const { uid } = req.user;

  try {
      // Fetch from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
          console.error('Firestore: No such document for UID:', uid);
          return res.status(404).json({ message: 'User not found in Firestore.' });
      }
      const firestoreData = userDoc.data();
      console.log('Fetched Firestore data:', firestoreData);

      // Fetch from MongoDB
      const mongoUser = await User.findOne({ firebaseUid: uid });
      if (!mongoUser) {
          console.error('MongoDB: No user found for UID:', uid);
          return res.status(404).json({ message: 'User not found in MongoDB.' });
      }
      console.log('Fetched MongoDB data:', mongoUser);

      // Combine the data
      const userData = {
          ...firestoreData,
          ...mongoUser.toObject(),
      };

      res.status(200).json({ user: userData });
  } catch (error) {
      console.error('Error fetching user data:', error.message);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.addToOrderList = async (req, res) => {
  try {
    const { userId, product_id, quantity } = req.body;

    if (!userId || !product_id || !quantity) {
      return res.status(400).json({ message: 'User ID, product ID, and quantity are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the product is already in the order list
    const existingItem = user.orderlist.find(
      item => item.product_id.toString() === product_id.toString()
    );

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += quantity;
    } else {
      // Add new item to the order list
      user.orderlist.push({ product_id, quantity });
    }

    await user.save();
    res.status(200).json({ message: 'Item added to order list successfully.', orderlist: user.orderlist });
  } catch (error) {
    console.error('Error adding to order list:', error);
    res.status(500).json({ message: 'Failed to add item to order list.' });
  }
};

exports.removeFromOrderList = async (req, res) => {
  try {
    const { userId, product_id } = req.body;

    if (!userId || !product_id) {
      return res.status(400).json({ message: 'User ID and product ID are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Remove the item from the order list
    user.orderlist = user.orderlist.filter(
      item => item.product_id.toString() !== product_id.toString()
    );

    await user.save();
    res.status(200).json({ message: 'Item removed from order list successfully.', orderlist: user.orderlist });
  } catch (error) {
    console.error('Error removing from order list:', error);
    res.status(500).json({ message: 'Failed to remove item from order list.' });
  }
};

