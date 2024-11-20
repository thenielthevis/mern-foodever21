// hooks/UserLogin.js
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Toast from "../Components/Layout/Toast";

const useLogin = () => {
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    const loginUser = async (credentials) => {
        setLoading(true);
        setError(null);
        console.log("Sending credentials: ", credentials); // Log the credentials
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
            const token = response.data.token;
            const user = response.data.user;

            // Use the login function from AuthContext to set the token and user data
            login(token, user);
            setLoading(false);
            return true;
        } catch (error) {
            console.error('Error logging in:', error); // Debugging: Log the error
            if (error.response) {
                // Server responded with a status other than 200 range
                setError(error.response.data.message || 'Login failed');
            } else if (error.request) {
                // Request was made but no response received
                setError('No response from server. Please try again later.');
            } else {
                // Something else happened while setting up the request
                setError('An unexpected error occurred. Please try again.');
            }
            setLoading(false);
            return false;
        }
    };

    return { loading, error, loginUser };
};

export default useLogin;