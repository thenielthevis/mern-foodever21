// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Components/Home';
import Header from './Components/Layout/Header';
import Footer from './Components/Layout/Footer';
import Products from './Components/Product/Products';
import ProductDetail from './Components/Product/ProductDetails';
import Login from './Auth/Login';
import Register from './Auth/Register';
import Profile from './Auth/Profile'; // Import Profile component
import UpdateEmail from './Auth/UpdateEmail';
import ChangePassword from './Auth/ChangePassword';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import Dashboard from './Components/Dashboard';
import './App.css';
import './Auth.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} /> {/* Add the profile route */}
          <Route path="/update-email" element={<UpdateEmail />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;