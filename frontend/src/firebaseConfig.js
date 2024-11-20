// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFqDm1tctixMmmUBoAnszZ-vckiLX21M4",
  authDomain: "foodever21-7618e.firebaseapp.com",
  projectId: "foodever21-7618e",
  storageBucket: "foodever21-7618e.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "396895111065",
  appId: "1:396895111065:web:11a4ba9614c8c337b73508",
  measurementId: "G-1G8EL43NMD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, auth, storage, db };