import { Card, Form, Typography, Input, Button, Alert, Spin, Upload } from "antd";
import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate from react-router-dom
import registerImage from "../assets/register.png";
import { useSignup } from "../hooks/UserSignup";
import { UploadOutlined } from '@ant-design/icons';

const Register = () => {
    const { loading, error, registerUser } = useSignup(); // Use the custom hook for user signup
    const navigate = useNavigate(); // Initialize useNavigate

    // Handle form submission
    const handleRegister = async (values) => {
        console.log("Form Values before processing:", values); // Check what data is in values
        values.email = values.email.trim().toLowerCase();
        console.log("Processed Form Values:", values); // Ensure email is processed
        
        const success = await registerUser(values);
        if (success) {
            navigate("/login");
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

                    <Form layout="vertical" onFinish={handleRegister} autoComplete="off">
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

                        <Form.Item
                            label="Confirm Password"
                            name="passwordConfirm"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your Confirm Password!",
                                },
                            ]}
                        >
                            <Input.Password size="large" placeholder="Re-enter your Password" />
                        </Form.Item>

                        <Form.Item
                            label="Profile Image"
                            name="image"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                        >
                            <Upload name="image" listType="picture" maxCount={1} beforeUpload={() => false}>
                                <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
                            </Upload>
                        </Form.Item>

                        {error && <Alert description={error} type="error" showIcon closable className="alert" />}

                        <Form.Item>
                            <Button type={loading ? "default" : "primary"} htmlType="submit" size="large" className="btn">
                                {loading ? <Spin /> : "Create Account"}
                            </Button>
                        </Form.Item>
                        
                        <Form.Item>
                            <Link to="/login" className="link">
                                <Button size="large" className="btn">
                                    Already have an account? Sign In
                                </Button>
                            </Link> 
                        </Form.Item>
                    </Form>
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