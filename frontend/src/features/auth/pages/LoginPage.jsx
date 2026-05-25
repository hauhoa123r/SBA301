import { useState } from 'react';
import {Button, Form, Row, Col } from 'react-bootstrap';
import HeroHeader from '../../../shared/components/HeroHeader.jsx';
import HeroFooter from '../../../shared/components/HeroFooter.jsx';
import { validInput } from '../../../shared/utils/inputHandler.js';
import { login } from '../service/authService.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import "../styles/login/login.css";
import { useAuth } from "../../../app/provider/AuthProvider";

const LoginPage = () => {
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const errorMessage = validInput(name, value);
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailError = validInput("email", formData.email);
        const passwordError = validInput("password", formData.password);

        if (emailError || passwordError) {
            setErrors({ email: emailError, password: passwordError });
            return;
        }
        try {
            const response = await login(formData);
            setUser(response.username);
            localStorage.setItem("user",JSON.stringify(response.username));
            toast.success("Đăng nhập thành công");
            navigate("/");
        } catch (err) {
            const errMsg = err.response?.data?.error || "Đăng nhập thất bại";
            toast.error(errMsg);
            navigate("/404");
        }
    };

    return (
        <div className="d-flex flex-column vh-100">
            <HeroHeader />
            <div className="d-flex align-items-center justify-content-center page-wrapper flex-grow-1 flex-shrink-1 p-3 overflow-auto"
                style={{ minHeight: 0 }}>
                <Row className="login-card-container g-0">

                    <Col md={6} className="left-side d-flex flex-column justify-content-between" style={{ minHeight: "580px" }}>
                        <div className="mt-4">
                            <h2>Login</h2>
                            <p className="small">Enter your account details</p>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4" controlId="loginUsername">
                                    <Form.Control className="input-clean-underline" type="text" placeholder="Email Address" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
                                    {errors.email && <Form.Text className="text-danger fw-semibold d-block mt-1">{errors.email}</Form.Text>}
                                </Form.Group>
                                <Form.Group className="mb-3 password-wrapper" controlId="loginPassword">
                                    <Form.Control
                                        type={showPassword ? "text" : "password"} 
                                        className="input-clean-underline"
                                        placeholder="Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709zM11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" /><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" /></svg>
                                        )}
                                    </span>
                                    {errors.password && <Form.Text className="text-danger fw-semibold d-block mt-1">{errors.password}</Form.Text>}
                                </Form.Group>
                                <div className="mb-4">
                                    <a href="#forgot" className="text-decoration-none small" style={{ color: "#7A7E85", fontSize: "0.85rem" }}>
                                        Forgot Password?
                                    </a>
                                </div>
                                <Button className="w-100 btn-purple-login mt-2" type="submit">
                                    Login
                                </Button>
                            </Form>
                        </div>
                        <div className="d-flex align-items-center gap-3 mt-4">
                            <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>Don't have an account?</span>
                            <button className="btn-dark-signup">Sign up</button>
                        </div>
                    </Col>
                    <Col md={6} className="right-side d-flex flex-column justify-content-between text-start">
                        <div>
                            <h1>Welcome to</h1>
                            <h1>student portal</h1>
                            <p>Login to access your account</p>
                        </div>

                        <div className="d-flex justify-content-center align-items-end mt-auto">
                            <img
                                src="../../../../public/images/undraw_morning-news_h9nz.svg"
                                alt="Illustration"
                            />
                        </div>
                    </Col>

                </Row>
            </div>
            <HeroFooter />
        </div >
    );
};

export default LoginPage;