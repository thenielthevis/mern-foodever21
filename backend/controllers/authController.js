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

// exports.signup = [
//   upload.single('image'),
//   async (req, res) => {
//     const { email, password, username } = req.body;
//     const imageFile = req.file;

//     if (!email || !password || !username) {
//       return res.status(400).json({ message: 'Email, password, and username are required.' });
//     }

//     const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
//     if (!validateEmail(email)) {
//       return res.status(400).json({ message: 'The email address is improperly formatted.' });
//     }

//     try {
//       const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
//       if (existingUser) {
//         return res.status(400).json({ message: 'The email address is already in use by another account.' });
//       }

//       const existingFirebaseUser = await admin.auth().getUserByEmail(email.trim().toLowerCase());
//       if (existingFirebaseUser) {
//         return res.status(400).json({ message: 'The email address is already in use by another account.' });
//       }
//     } catch (error) {
//       if (error.code !== 'auth/user-not-found') {
//         return res.status(400).json({ message: error.message });
//       }
//     }

//     try {
//       const userRecord = await admin.auth().createUser({
//         email: email.trim().toLowerCase(),
//         password,
//         displayName: username,
//       });

//       const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email.trim().toLowerCase());

//       let imageUrl = '';
//       if (imageFile) {
//         const uploadResponse = await cloudinary.uploader.upload(imageFile.path, { folder: 'user_images' });
//         imageUrl = uploadResponse.secure_url;
//       }

//       const newUser = new User({
//         email: email.trim().toLowerCase(),
//         username,
//         firebaseUid: userRecord.uid,
//         imageUrl,
//       });
//       await newUser.save();

//       await db.collection('users').doc(userRecord.uid).set({
//         email: email.trim().toLowerCase(),
//         username,
//         firebaseUid: userRecord.uid,
//         imageUrl,
//       });

//       res.status(201).json({ message: 'User created successfully. Please verify your email.', user: userRecord, emailVerificationLink });
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   }
// ];

// Controller function to handle user login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Firebase Authentication Client SDK should handle password verification on the client side.
    // Here, we assume the client sends a valid ID token after successful login.
    const userRecord = await admin.auth().getUserByEmail(email);
    // Respond with success message and user details
    res.status(200).json({ message: 'User logged in successfully', user: userRecord });
  } catch (error) {
    // Respond with error message if login fails
    res.status(400).json({ message: error.message });
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