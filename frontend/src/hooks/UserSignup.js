import { useState } from "react";
import { message } from "antd";
import { useAuth } from "../context/AuthContext";
import { auth } from '../firebaseConfig';

const useSignup = () => {
    const { login } = useAuth();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).trim().toLowerCase());
    };

    const registerUser = async (values) => {
        const trimmedEmail = values.email.trim().toLowerCase();

        if (!validateEmail(trimmedEmail)) {
            setError("Invalid email format!");
            message.error("Invalid email format!");
            return false;
        }
        if (values.password !== values.passwordConfirm) {
            setError("Passwords do not match!");
            message.error("Passwords do not match!");
            return false;
        }
        try {
            setError(null);
            setLoading(true);

            const formData = new FormData();
            formData.append('username', values.username);
            formData.append('email', trimmedEmail);
            formData.append('password', values.password);
            if (values.image && values.image[0]) {
                formData.append('image', values.image[0].originFileObj);
            }

            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.status === 201) {
                message.success(data.message);
                login(data.token, data.user);

                const user = auth.currentUser;
                if (user) {
                    await user.sendEmailVerification({ url: data.emailVerificationLink });
                    console.log("Verification email sent to:", user.email);
                }

                return true;
            } else {
                setError(data.message);
                message.error(data.message);
                return false;
            }
        } catch (error) {
            setError(error.message || 'An unexpected error occurred.');
            message.error(error.message || 'An unexpected error occurred.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, registerUser };
};

export { useSignup };