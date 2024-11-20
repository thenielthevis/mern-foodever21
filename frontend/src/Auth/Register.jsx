import { Card, Typography, Button, Upload } from "antd";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "../assets/register.png";
import { useAuth } from "../context/AuthContext";
import { UploadOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TextField, InputAdornment, LinearProgress, Box, Alert } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import '../Auth.css'; // Import the CSS file

const Register = () => {
    const { registerWithEmail } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ type: '', message: '' });

    // Yup validation schema
    const SignupSchema = Yup.object().shape({
        username: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
        email: Yup.string().email('Invalid email').required('Required'),
        password: Yup.string().min(6, 'Too Short!').required('Required'),
        passwordConfirm: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Required'),
    });

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(SignupSchema)
    });

    // Handle form submission
    const onSubmit = async (values) => {
        console.log("Form Values before processing:", values);
        values.email = values.email.trim().toLowerCase();
        console.log("Processed Form Values:", values);

        try {
            setLoading(true);
            const successMessage = await registerWithEmail(values.email, values.password, values.username, values.image[0].originFileObj);
            setAlert({ type: 'success', message: successMessage });
            setTimeout(() => {
                navigate("/login");
            }, 3000); // Delay navigation by 3 seconds to show the success message
        } catch (error) {
            setAlert({ type: 'error', message: error.message || 'Failed to create account. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Normalize file input for the form
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    return (
        <Card className="form-container">
            <div className="flex-container">
                {/* form */}
                <div className="form-content">
                    <Typography.Title level={3} strong className="title">
                        Create an Account
                    </Typography.Title>
                    <Typography.Title level={3} strong className="slogan">
                        Sizzle, Twirl, Bite! Where Flavor Meets Every Craving!
                    </Typography.Title>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="username">Username</label>
                            <Controller
                                name="username"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <TextField
                                            {...field}
                                            fullWidth
                                            size="large"
                                            placeholder="Enter your Username"
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AccountCircle />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={!!errors.username}
                                            helperText={errors.username ? errors.username.message : ''}
                                            sx={{ mb: 2 }}
                                        />
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor="email">Email</label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <>
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
                                            sx={{ mb: 2 }}
                                        />
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <>
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
                                            sx={{ mb: 2 }}
                                        />
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor="passwordConfirm">Confirm Password</label>
                            <Controller
                                name="passwordConfirm"
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <TextField
                                            {...field}
                                            fullWidth
                                            type="password"
                                            size="large"
                                            placeholder="Re-enter your Password"
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={!!errors.passwordConfirm}
                                            helperText={errors.passwordConfirm ? errors.passwordConfirm.message : ''}
                                            sx={{ mb: 2 }}
                                        />
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <Controller
                                name="image"
                                control={control}
                                render={({ field }) => (
                                    <Upload
                                        fileList={field.value}
                                        listType="picture"
                                        maxCount={1}
                                        beforeUpload={() => false}
                                        onChange={(info) => field.onChange(normFile(info))}
                                    >
                                        <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
                                    </Upload>
                                )}
                            />
                        </div>
                        {alert.message && <Alert severity={alert.type}>{alert.message}</Alert>}
                        <div>
                            {loading ? (
                                <Box sx={{ width: '100%' }}>
                                    <LinearProgress />
                                </Box>
                            ) : (
                                <Button type="primary" htmlType="submit" size="large" className="btn" disabled={isSubmitting || loading}>
                                    Create Account
                                </Button>
                            )}
                        </div>
                        <div>
                            <Link to="/login" className="link">
                                <Button variant="contained" size="large" className="btn">
                                    Already have an account? Sign In
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>

                {/* image */}
                <div className="image-content">
                    <img src={registerImage} className="auth-image" alt="Register" />
                </div>
            </div>
        </Card>
    );
};

export default Register;