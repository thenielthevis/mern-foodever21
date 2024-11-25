import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './Components/Home';
import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';
import Products from './Components/Product/Products';
import ProductDetail from './Components/Product/ProductDetails';
import CheckoutPage from './Components/Product/CheckoutPage';
import OrderHistory from './Auth/OrderHistory';
import Login from './Auth/Login';
import Register from './Auth/Register';
import Profile from './Auth/Profile';
import UpdateEmail from './Auth/UpdateEmail';
import ChangePassword from './Auth/ChangePassword';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './Components/Dashboard';
import OrderChartContainer from './admin/OrderChart';
import StatusTable from './admin/StatusTable';
import ProductTable from './admin/ProductTable';
import './App.css';
import './Auth.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import Unauthorized from './Components/Unauthorized';
import Toast from "../src/Components/Layout/Toast";

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Messaging
const messaging = getMessaging(firebaseApp);

// Function to Request Notification Permission
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Have permission');
    } else {
      console.log('Denied permission');
    }
  } catch (error) {
    console.error('Error requesting notification permission or retrieving token:', error);
  }
};

const AppContent = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);

  const fetchOrderCount = async () => {
    try {
      if (!currentUser) {
        setOrderCount(0);
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.get(`${import.meta.env.VITE_API}/user-orderlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const totalOrderCount = response.data.orders.reduce((acc, order) => acc + order.quantity, 0);
      setOrderCount(totalOrderCount);
    } catch (error) {
      console.error('Error fetching order count:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      if (!user) setOrderCount(0);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) fetchOrderCount();
  }, [currentUser]);

  useEffect(() => {
    const initializeFCM = async () => {
      if (currentUser) {
        await requestNotificationPermission();
  
        // Fetch the current user details from the backend
        try {
          console.log("Fetching user details from backend...");
          const token = localStorage.getItem('token'); // Retrieve the stored token
          const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          console.log("User details fetched:", userResponse.data);
          const currentUserId = userResponse.data.user._id; // Assuming the ID is available in `userResponse.data.user._id`
  
          console.log('Current User ID:', currentUserId);
  
          // Listen for foreground messages
          onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);
  
            // Log the userId from the notification payload
            console.log('Payload User ID:', payload.data.userId);
  
            // Check if the notification belongs to the current user
            const notificationUserId = payload.data.userId;
            if (notificationUserId === currentUserId) {
              // Display notification as a toast
              Toast(`${payload.notification.title}: ${payload.notification.body}`, "success");
            } else {
              console.log("Notification does not belong to current user.");
            }
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };
  
    initializeFCM();
  }, [currentUser]);

  const noHeaderFooterRoutes = ['/checkout', '/login', '/register', '/unauthorized'];
  const noBackgroundRoutes = ['/checkout'];
  const hideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);

  useEffect(() => {
    if (noBackgroundRoutes.includes(location.pathname)) {
      document.body.classList.add('no-background');
    } else {
      document.body.classList.remove('no-background');
    }
  }, [location]);

  // Register the service worker manually in the app
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Get FCM token
    const messaging = getMessaging(firebaseApp);
    getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
      .then((currentToken) => {
        if (currentToken) {
          console.log('FCM Token:', currentToken);
        } else {
          console.log('No FCM token available');
        }
      })
      .catch((error) => {
        console.error('Error getting FCM token:', error);
      });
  }, []);

  return (
    <>
      {!hideHeaderFooter && (
        <Header orderCount={orderCount} onUpdateOrderCount={fetchOrderCount} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/product/:id"
          element={<ProductDetail onUpdateOrderCount={fetchOrderCount} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/update-email" element={<UpdateEmail />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/orders-chart" element={<OrderChartContainer />} />
        <Route path="/admin/status-table" element={<StatusTable />} />
        <Route path="/admin/products" element={<ProductTable />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
      <ToastContainer />
    </>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
