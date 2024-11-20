import { Card, Form, Typography, Input, Button, Alert, Spin } from "antd";
import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate from react-router-dom
import registerImage from "../assets/register.png";
import useLogin from "../hooks/UserLogin";
import Toast from "../Components/Layout/Toast";

const Login = () => {
    const { loading, error, loginUser } = useLogin();
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogin = async (values) => {
        console.log("Received values of form: ", values);
        const success = await loginUser(values);
        
        if (success) {
            // Show success toast
            Toast("Signed in successfully!", "success");

            // Redirect to home page after login
            navigate("/", { replace: true });
        } else {
            // Handle failed login
            Toast("Login failed. Please try again.", "error");
        }
    };

    return (
        <Card className="form-container">
            <div className="flex-container">
                {/* image */}
                <div className="image-content">
                    <img src={registerImage} className="auth-loginimage" alt="Register" />
                </div>
                {/* form */}
                <div className="form-content">
                    <Typography.Title level={3} strong className="title">
                        Sign In
                    </Typography.Title>
                    <Typography.Title level={3} strong className="slogan">
                        Sizzle, Twirl, Bite! Where Flavor Meets Every Craving!
                    </Typography.Title>

                    <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your Username!",
                                },
                            ]}
                        >
                            <Input size="large" placeholder="Enter your Username" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your Email!",
                                },
                                {
                                    type: "email",
                                    message: "The input is not valid email!",
                                }
                            ]}
                        >
                            <Input size="large" placeholder="Enter your Email" />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your Password!",
                                },
                            ]}
                        >
                            <Input.Password size="large" placeholder="Enter your Password" />
                        </Form.Item>

                        {error && <Alert description={error} type="error" showIcon closable className="alert" />}

                        <Form.Item>
                            <Button type={loading ? "default" : "primary"} htmlType="submit" size="large" className="btn" loading={loading}>
                                {loading ? <Spin /> : "Sign In"}
                            </Button>
                        </Form.Item>
                        
                        <Form.Item>
                            <Link to="/register" className="link">
                                <Button size="large" className="btn">
                                    Create Account
                                </Button>
                            </Link> 
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Card>
    );
};

export default Login;