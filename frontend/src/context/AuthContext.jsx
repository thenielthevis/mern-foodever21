import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebaseConfig';
import {
    signInWithPopup,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateEmail,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const token = await currentUser.getIdToken();
                setToken(token);
                setUser(currentUser);
            } else {
                setToken(null);
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const reloadUser = async () => {
        if (!auth.currentUser) {
            console.error("No user is currently logged in.");
            throw new Error("User not logged in. Please log in again.");
        }

        await auth.currentUser.reload(); // Refreshes the current user's state
        return auth.currentUser;
    };

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Reload user to ensure the email verification status is up-to-date
            await reloadUser().catch((error) => {
                console.error("Error reloading user:", error);
                throw new Error("Failed to reload user. Please log in again.");
            });
    
            // Check if the user's email is verified
            if (!user.emailVerified) {
                await signOut(auth);
                throw new Error('Please verify your email before logging in.');
            }
    
            // Get the Firebase ID token
            const token = await user.getIdToken();
            setToken(token);
            setUser(user);
    
            // Save the token in localStorage
            localStorage.setItem('token', token);
    
            // Set the token in the default Authorization header for axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error("Error logging in: ", error);
            throw error;
        }
    };    

    const registerWithEmail = async (email, password, username, avatarFile = null) => {
        try {
            // Step 1: Check if the email already exists in MongoDB using the backend API
            const existingUserResponse = await fetch(`http://localhost:5000/api/auth/check-email/${email}`);
            const existingUserData = await existingUserResponse.json();
    
            if (existingUserData.exists) {
                // If the email exists, delete the existing user in Firebase
                await fetch(`http://localhost:5000/api/auth/delete-user/${email}`, {
                    method: 'DELETE',
                });
                console.log(`User with email ${email} deleted from Firebase.`);
            }
    
            // Step 2: Create the user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Step 3: Send email verification
            await sendEmailVerification(user);
    
            // Step 4: Handle avatar upload (if provided)
            let avatarURL = '';
            let cloudinaryId = '';
            if (avatarFile) {
                const formData = new FormData();
                formData.append('image', avatarFile);
    
                const uploadResponse = await fetch('http://localhost:5000/api/auth/upload-avatar', {
                    method: 'POST',
                    body: formData,
                });
    
                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.message || 'Failed to upload avatar');
                }
    
                const data = await uploadResponse.json();
                avatarURL = data.secure_url;
                cloudinaryId = data.public_id; // Assuming the API returns the Cloudinary public ID
            } else {
                avatarURL = 'https://default-avatar-url.com/avatar.png'; // Default avatar
            }
    
            // Step 5: Prepare user details for Firestore and MongoDB
            const userDetails = {
                username: username,
                email: user.email,
                password: password, // MongoDB requires a password field; consider hashing it here.
                firebaseUid: user.uid,
                role: 'user', // Default role
                status: 'active', // Default status in MongoDB
                userImage: avatarURL, // Avatar URL
                cloudinary_id: cloudinaryId, // Cloudinary public ID
            };
    
            // Step 6: Save user details to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                username: userDetails.username,
                email: userDetails.email,
                avatarURL: userDetails.userImage,
                createdAt: new Date(),
                status: 'unverified', // Firestore status is initially "unverified"
            });
            console.log('User saved to Firestore.');
    
            // Step 7: Save user details to MongoDB using the backend API
            const mongoResponse = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userDetails),
            });
    
            if (!mongoResponse.ok) {
                const mongoError = await mongoResponse.json();
                throw new Error(mongoError.message || 'Failed to save user to MongoDB');
            }
            console.log('User saved to MongoDB.');
    
            // Step 8: Sign out the user to enforce email verification
            await signOut(auth);
    
            return 'Account created successfully! Please verify your email before logging in.';
        } catch (error) {
            console.error('Error registering with email:', error.message);
            throw error;
        }
    };    

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error("Error logging out: ", error);
            alert('Failed to log out: ' + error.message);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                registerWithEmail,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
