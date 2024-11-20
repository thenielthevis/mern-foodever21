import React, { useState, useEffect } from 'react';
import { Card, Typography, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "../assets/register.png";
import { useAuth } from "../context/AuthContext";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, InputAdornment, LinearProgress, Box, Alert } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import '../Auth.css'; // Import the CSS file

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const Login = () => {
    const { loading, login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [alert, setAlert] = useState({ type: '', message: '' });

    // Yup validation schema
    const LoginSchema = Yup.object().shape({
        email: Yup.string().email('The input is not valid email!').required('Please input your Email!'),
        password: Yup.string().required('Please input your Password!'),
    });

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(LoginSchema)
    });

    useEffect(() => {
        if (loading) {
            const timer = setInterval(() => {
                setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
            }, 800);
            return () => {
                clearInterval(timer);
            };
        }
    }, [loading]);

    // Handle form submission
    const onSubmit = async (values) => {
        console.log("Received values of form: ", values);
        try {
            await login(values.email, values.password);
            setAlert({ type: 'success', message: 'Login successful!' });
            navigate("/"); // Redirect to dashboard after successful login
        } catch (err) {
            setAlert({ type: 'error', message: err.message });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            setAlert({ type: 'success', message: 'Google login successful!' });
            navigate("/"); // Redirect to dashboard after successful login
        } catch (error) {
            setAlert({ type: 'error', message: 'Google login failed. Please try again.' });
            console.error("Google login failed", error);
        }
    };

    return (
        <Card className="form-container">
            <div className="flex-container">
                <div className="image-content">
                    <img src={registerImage} className="auth-loginimage" alt="Register" />
                </div>
                <div className="form-content">
                    <Typography.Title level={3} strong className="title">
                        Sign In
                    </Typography.Title>
                    <Typography.Title level={3} strong className="slogan">
                        Sizzle, Twirl, Bite! Where Flavor Meets Every Craving!
                    </Typography.Title>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="email">Email</label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        size="large"
                                        placeholder="Enter your Email"
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        error={!!errors.email}
                                        helperText={errors.email ? errors.email.message : ''}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="password"
                                        size="large"
                                        placeholder="Enter your Password"
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        error={!!errors.password}
                                        helperText={errors.password ? errors.password.message : ''}
                                    />
                                )}
                            />
                        </div>

                        {alert.message && <Alert severity={alert.type}>{alert.message}</Alert>}

                        <div>
                            {loading ? (
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgressWithLabel value={progress} />
                                </Box>
                            ) : (
                                <Button type="primary" htmlType="submit" size="large" className="btn" disabled={isSubmitting || loading}>
                                    Sign In
                                </Button>
                            )}
                        </div>

                        <div>
                            <Button type="default" size="large" className="btn" onClick={handleGoogleLogin}>
                                Sign In with Google
                            </Button>
                        </div>
                        
                        <div>
                            <Link to="/register" className="link">
                                <Button variant="contained" size="large" className="btn">
                                    Create Account
                                </Button>
                            </Link> 
                        </div>
                    </form>
                </div>
            </div>
        </Card>
    );
};

export default Login;