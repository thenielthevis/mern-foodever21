import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "../assets/register.png";
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    Alert,
    InputAdornment,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { auth, googleProvider } from "../firebaseConfig"; // Import from your Firebase config
import { signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import "../Auth.css"; // Ensure this path is correct

const Login = () => {
    const { loading, login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [isResetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

    // Yup validation schema
    const LoginSchema = Yup.object().shape({
        email: Yup.string()
            .email("The input is not a valid email!")
            .required("Please input your Email!"),
        password: Yup.string().required("Please input your Password!")
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
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

    const onSubmit = async (values) => {
        console.log("Received values of form: ", values);
        try {
            await login(values.email, values.password);

            // Retrieve user role from localStorage (set during login)
            const role = localStorage.getItem("role");

            setAlert({ type: "success", message: "Login successful!" });

            // Navigate based on role
            if (role === "admin") {
                navigate("/admin/*");
            } else if (role === "user") {
                navigate("/");
            } else {
                setAlert({ type: "error", message: "Unknown role. Contact support." });
            }
        } catch (err) {
            setAlert({ type: "error", message: err.message });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            setAlert({ type: "success", message: "Google login successful!" });
            navigate("/"); // Redirect to dashboard after successful login
        } catch (error) {
            setAlert({ type: "error", message: "Google login failed. Please try again." });
            console.error("Google login failed", error);
        }
    };

    const handleForgotPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setAlert({ type: "success", message: "Password reset email sent!" });
            setResetDialogOpen(false);
        } catch (error) {
            setAlert({
                type: "error",
                message: `Failed to send reset email: ${error.message}`
            });
        }
    };

    return (
        <Card className="form-container">
            <Box className="flex-container">
                <div className="image-content">
                    <img src={registerImage} className="auth-loginimage" alt="Register" />
                </div>
                <Box className="form-content">
                    <Typography variant="h3" component="h1" className="title">
                        Sign In
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email"
                                        fullWidth
                                        margin="normal"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                        error={!!errors.email}
                                        helperText={errors.email ? errors.email.message : ""}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Password"
                                        fullWidth
                                        margin="normal"
                                        type="password"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon />
                                                </InputAdornment>
                                            )
                                        }}
                                        error={!!errors.password}
                                        helperText={errors.password ? errors.password.message : ""}
                                    />
                                )}
                            />
                        </div>

                        {alert.message && <Alert severity={alert.type} className="alert">{alert.message}</Alert>}

                        <div>
                            <Button
                                type="submit"
                                size="large"
                                className="btn"
                                disabled={isSubmitting || loading}
                            >
                                Sign In
                            </Button>
                        </div>

                        <div>
                            <Button
                                type="default"
                                size="large"
                                className="btn"
                                onClick={handleGoogleLogin}
                            >
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
                        <Typography
                            sx={{ mt: 2, textAlign: "center", cursor: "pointer", color: "blue" }}
                            onClick={() => setResetDialogOpen(true)}
                        >
                            Forgot your password?
                        </Typography>
                    </form>
                    <Dialog open={isResetDialogOpen} onClose={() => setResetDialogOpen(false)}>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Enter your email"
                                type="email"
                                fullWidth
                                margin="dense"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setResetDialogOpen(false)} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleForgotPassword} color="primary">
                                Send Reset Link
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Card>
    );
};

export default Login;
