import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';
import Products from './Components/Product/Products';
import ProductDetail from './Components/Product/ProductDetails';
import Login from './Auth/Login';
import Register from './Auth/Register';
import Profile from './Auth/Profile';
import UpdateEmail from './Auth/UpdateEmail';
import ChangePassword from './Auth/ChangePassword';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import './Auth.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null); // Track logged-in user
  const [orderCount, setOrderCount] = useState(0); // Track total items in order list

  // Fetch the order count from the backend
  const fetchOrderCount = async () => {
    try {
      if (!currentUser) {
        console.log('No user is currently logged in.');
        setOrderCount(0);
        return;
      }

      const token = await currentUser.getIdToken(); // Fetch Firebase token
      console.log('Firebase Token:', token);

      const response = await axios.get(
        `${import.meta.env.VITE_API}/user-orderlist`, // Adjust API endpoint if needed
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in request headers
          },
        }
      );

      // Calculate the total number of items in the user's order list
      const totalOrderCount = response.data.orders.reduce(
        (acc, order) => acc + order.quantity,
        0
      );

      console.log('Total Order Count:', totalOrderCount);
      setOrderCount(totalOrderCount);
    } catch (error) {
      console.error('Error fetching order count:', error);
    }
  };

  // Track authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User logged in:', user.email);
        setCurrentUser(user); // Set current user when logged in
      } else {
        console.log('No user is currently logged in.');
        setCurrentUser(null); // Clear user state when logged out
        setOrderCount(0); // Reset order count
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // Fetch order count whenever the currentUser state updates
  useEffect(() => {
    if (currentUser) {
      fetchOrderCount();
    }
  }, [currentUser]);

  // Update the order count when an item is added to the order list
  const onUpdateOrderCount = () => {
    fetchOrderCount(); // Re-fetch the order count
  };

  return (
    <AuthProvider>
      <Router>
      <Header orderCount={orderCount} onUpdateOrderCount={onUpdateOrderCount} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/product/:id"
            element={<ProductDetail onUpdateOrderCount={onUpdateOrderCount} />} // Pass onUpdateOrderCount
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-email" element={<UpdateEmail />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
        <Footer />
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;