import { useState } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import HeroHeader from '../shared/component/HeroHeader';
import HeroFooter from '../shared/component/HeroFooter';
import { validInput } from '../../../shared/utils/inputHandler.js';
import { login } from '../service/authService.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const LoginPage = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
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
            toast.success("Đăng nhập thành công");
            navigate("/");
        } catch (err) {
            toast.error(err.response.data.error);
        }
    };
    return (
        <div className="d-flex flex-column min-vh-100">
            <HeroHeader />
            <Container className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Card className="w-100 shadow-lg border-0" style={{ maxWidth: "550px" }}>
                    <Card.Body className="p-4 p-md-5">
                        <Card.Title className="fs-2 text-center mb-2 fw-bold">Welcome Back</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label className="small fw-medium text-muted">Email Address</Form.Label>
                                <Form.Control className="border py-2" type="email" placeholder="Enter email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur}
                                />
                                {errors.email && <Form.Text className="text-danger fw-semibold">{errors.email}</Form.Text>}
                            </Form.Group>
                            <Form.Group className="mb-4" controlId="formBasicPassword">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <Form.Label className="small fw-medium text-muted mb-0">Password</Form.Label>
                                    <a href="/forgot-password" className="text-decoration-none small fw-medium" style={{ color: "#5045E6" }}>
                                        Forget password?
                                    </a>
                                </div>
                                <Form.Control className="border py-2" type="password" placeholder="********" name="password" value={formData.password}
                                    onChange={handleChange} onBlur={handleBlur} />
                                {errors.password && <Form.Text className="text-danger fw-semibold">{errors.password}</Form.Text>}
                            </Form.Group>
                            <Button type="submit" className="w-100 py-2 fw-semibold" style={{ backgroundColor: "#5045E6", borderColor: "#5045E6" }}>
                                Sign In
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
            <HeroFooter />
        </div>
    );
};

export default LoginPage;