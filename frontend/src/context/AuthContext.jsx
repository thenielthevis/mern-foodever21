import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebaseConfig';
import { signInWithPopup, onAuthStateChanged, createUserWithEmailAndPassword, sendEmailVerification, updateEmail, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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

    const login = async (email, password) => {
        try {
            console.log("Email:", email);
            console.log("Password:", password);
    
            if (typeof email !== 'string' || typeof password !== 'string') {
                throw new Error('Invalid email or password format.');
            }
    
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            if (!user.emailVerified) {
                await signOut(auth);
                throw new Error('Please verify your email before logging in.');
            }
    
            const token = await user.getIdToken();
            console.log("Custom Token:", token);
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token); // Store token in local storage
        } catch (error) {
            console.error("Error logging in: ", error);
            throw error;
        }
    };
    
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
    
            if (!user.emailVerified) {
                await signOut(auth);
                alert('Please verify your email before logging in.');
                return;
            }
    
            const token = await user.getIdToken();
    
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                const response = await fetch(user.photoURL);
                const blob = await response.blob();
    
                const formData = new FormData();
                formData.append('image', blob, 'avatar.jpg');
    
                const uploadResponse = await fetch('http://localhost:5000/api/auth/upload-avatar', {
                    method: 'POST',
                    body: formData
                });
    
                if (!uploadResponse.ok) {
                    if (uploadResponse.status === 500) {
                        throw new Error('Internal Server Error');
                    } else {
                        const errorData = await uploadResponse.json();
                        throw new Error(errorData.message || 'Failed to upload avatar');
                    }
                }
    
                const data = await uploadResponse.json();
                const avatarURL = data.secure_url;
    
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    username: user.displayName,
                    avatarURL: avatarURL,
                    createdAt: new Date(),
                    status: user.emailVerified ? 'verified' : 'unverified'
                });
            }
    
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token); // Store token in local storage
        } catch (error) {
            console.error("Error logging in with Google: ", error);
            alert(error.message);
        }
    };
    
    const registerWithEmail = async (email, password, username, avatarFile) => {
        try {
            // Check if the email already exists in Firebase Authentication
            const existingUser = await fetch(`http://localhost:5000/api/auth/check-email/${email}`);
            const existingUserData = await existingUser.json();
    
            if (existingUserData.exists) {
                // If user exists in Firebase, delete the user
                await fetch(`http://localhost:5000/api/auth/delete-user/${email}`, {
                    method: 'DELETE',
                });
                console.log(`User with email ${email} deleted from Firebase.`);
            }
    
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Send email verification link
            await sendEmailVerification(user);
    
            // Wait until email is verified (check on frontend)
            alert('Please verify your email before continuing!');
            
            // Proceed after email is verified
            if (user.emailVerified) {
                // Upload avatar to Cloudinary via backend
                const formData = new FormData();
                formData.append('image', avatarFile);
    
                const response = await fetch('http://localhost:5000/api/auth/upload-avatar', {
                    method: 'POST',
                    body: formData
                });
    
                if (!response.ok) {
                    if (response.status === 500) {
                        throw new Error('Internal Server Error');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to upload avatar');
                    }
                }
    
                const data = await response.json();
                const avatarURL = data.secure_url;
    
                // Prepare user details
                const userDetails = {
                    email: user.email,
                    username: username,
                    avatarURL: avatarURL,
                    createdAt: new Date(),
                    status: user.emailVerified ? 'verified' : 'unverified',
                    password: password, // Include password
                };
    
                // Log user details
                console.log('User details to be saved:', userDetails);
    
                // Save user details to Firestore
                await setDoc(doc(db, 'users', user.uid), userDetails);
    
                // Save user details to MongoDB
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
    
                // Sign out the user immediately after registration
                await signOut(auth);
    
                return 'Account created successfully! Please verify your email before logging in.';
            } else {
                return 'Please verify your email before proceeding.';
            }
        } catch (error) {
            console.error("Error registering with email: ", error);
            throw error;
        }
    };
     

    const handleUpdate = async (updatedData) => {
        try {
            let avatarURL = user.photoURL;

            if (updatedData.file) {
                // Upload avatar to Cloudinary via backend
                const formData = new FormData();
                formData.append('image', updatedData.file);

                const response = await fetch('http://localhost:5000/api/auth/upload-avatar', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    if (response.status === 500) {
                        throw new Error('Internal Server Error');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to upload avatar');
                    }
                }

                const data = await response.json();
                avatarURL = data.secure_url;
            }

            const userRef = doc(db, 'users', user.uid);
            const { file, ...dataWithoutFile } = updatedData; // Exclude the file field
            await setDoc(userRef, {
                ...dataWithoutFile,
                avatarURL,
            }, { merge: true });

            setUser((prevUser) => ({ ...prevUser, ...dataWithoutFile, photoURL: avatarURL }));
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    };

    const updateEmailAddress = async (newEmail) => {
        try {
            await sendEmailVerification(auth.currentUser, { url: window.location.href });

            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { email: newEmail }, { merge: true });

            return 'A verification email has been sent to your new email address. Please verify it before logging in again.';
        } catch (error) {
            return 'Failed to update email: ' + error.message;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent. Please check your inbox.');
        } catch (error) {
            alert('Failed to send password reset email: ' + error.message);
        }
    };

    const logout = async () => {
        try {
          await signOut(auth);  // Firebase sign-out
          
          // Clear local storage
          localStorage.removeItem('token');
          
          // Reset app state
          setToken(null);
          setUser(null);
        } catch (error) {
          console.error("Error logging out: ", error);
          alert('Failed to log out: ' + error.message);
        }
      };          

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loginWithGoogle, registerWithEmail, handleUpdate, updateEmailAddress, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);