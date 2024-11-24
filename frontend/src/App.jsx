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
import Dashboard from "./Components/Dashboard";
import OrderChartContainer from "./admin/OrderChart"; // Import the OrderChart component
import StatusTable from "./admin/StatusTable"; // Import the StatusTable component
import ProductTable from "./admin/ProductTable"; // Import the ProductTable component
import './App.css';
import './Auth.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const AppContent = () => {
  const location = useLocation(); // Track the current route
  const [currentUser, setCurrentUser] = useState(null); // Track the logged-in user
  const [orderCount, setOrderCount] = useState(0); // Track the total order count
  const [orderData, setOrderData] = useState([]); // Track the order data

  // Fetch the order count from the backend
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

      const totalOrderCount = response.data.orders.reduce(
        (acc, order) => acc + order.quantity,
        0
      );
      setOrderCount(totalOrderCount);
    } catch (error) {
      console.error('Error fetching order count:', error);
    }
  };

  // Track authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      if (!user) setOrderCount(0); // Reset order count if logged out
    });
    return () => unsubscribe();
  }, []);

  // Fetch the order count whenever the current user changes
  useEffect(() => {
    if (currentUser) fetchOrderCount();
  }, [currentUser]);

  const onUpdateOrderCount = () => {
    fetchOrderCount(); // Update the order count
  };

  // Define routes where header, footer, and background should be adjusted
  const noHeaderFooterRoutes = ['/checkout', '/login', '/register'];
  const noBackgroundRoutes = ['/checkout'];
  const hideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname);

  // Dynamically adjust the `<body>` class based on the route
  useEffect(() => {
    if (noBackgroundRoutes.includes(location.pathname)) {
      document.body.classList.add('no-background');
    } else {
      document.body.classList.remove('no-background');
    }
  }, [location]);

  return (
    <>
      {!hideHeaderFooter && (
        <Header orderCount={orderCount} onUpdateOrderCount={onUpdateOrderCount} />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/product/:id"
          element={<ProductDetail onUpdateOrderCount={onUpdateOrderCount} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/update-email" element={<UpdateEmail />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/orders-chart" element={<OrderChartContainer />} /> {/* Corrected the route */}
        <Route path="/admin/status-table" element={<StatusTable />} /> {/* Added the route for StatusTable */}
        <Route path="/admin/products" element={<ProductTable />} /> {/* Added the route for ProductTable */}
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