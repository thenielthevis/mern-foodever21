import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Dashboard from './Components/Dashboard'; // Update the import path
import UserTable from './admin/User'; // Import the UserTable component
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/update-email" element={<UpdateEmail />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/dashboard" element={<Dashboard />} /> {/* Add the dashboard route */}
          <Route path="/users" element={<UserTable />} /> {/* Add the user table route */}
        </Routes>
        <Footer />
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
};

export default App;