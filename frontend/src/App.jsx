
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
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import './App.css';
import './Auth.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <AuthProvider> {/* Wrap your application with AuthProvider */}
        <Router>
          <Header /> {/* Render Header outside of Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} /> {/* Add the login route */}
            <Route path="/register" element={<Register />} /> {/* Add the register route */}
          </Routes>
          <Footer /> {/* Render Footer outside of Routes */}
        </Router>
      </AuthProvider>
      <ToastContainer />
    </div>
  );
}

export default App;