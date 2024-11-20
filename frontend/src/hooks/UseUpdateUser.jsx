import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const useUpdateUser = () => {
    const { setUserData } = useContext(AuthContext);
    const [error, setError] = useState(null);

    const updateUser = async (formData) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('email', formData.email);
            if (formData.image) formDataToSend.append('image', formData.image);

            const token = localStorage.getItem('token'); // Retrieve the JWT token from local storage

            if (!token) {
                throw new Error('No token found in local storage');
            }

            console.log('Token found:', token); // Debugging: Log the token
            console.log('FormData to send:', formDataToSend); // Debugging: Log the FormData

            const response = await axios.put('http://localhost:5000/api/auth/updateUser', formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Response:', response.data); // Debugging: Log the response

            setUserData(response.data.user); // Update context with new user data
            return response.data.user;
        } catch (error) {
            console.error('Error updating user:', error); // Debugging: Log the error
            setError(error);
            throw error;
        }
    };

    return { updateUser, error };
};

export default useUpdateUser;