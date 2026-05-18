import { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { loginApi } from "../api/authApi";
const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [validated, setValidated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            try {
                const response = await loginApi(formData);
                console.log(response.data);
                alert("Đăng nhập thành công");
            } catch (error) {
                console.log(error);
                alert("Sai tài khoản hoặc mật khẩu");
            }
        }
        setValidated(true);
    };
    return (
        <Container fluid className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">Xin Chào!</h2>
                                <p className="text-muted">Đăng nhập để tiếp tục trải nghiệm</p>
                            </div>
                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="formEmail">
                                    <Form.Label className="fw-semibold">Tên đăng nhập</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="py-2"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Vui lòng nhập tên đăng nhập.
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label className="fw-semibold">Mật khẩu</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Nhập mật khẩu"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="py-2"
                                        />
                                        <InputGroup.Text
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </InputGroup.Text>
                                        <Form.Control.Feedback type="invalid">
                                            Vui lòng nhập mật khẩu.
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Form.Check
                                        type="checkbox"
                                        id="rememberMe"
                                        label="Ghi nhớ tôi"
                                        className="text-muted"
                                    />
                                    <a href="#forgot" className="text-decoration-none text-primary fw-semibold small">
                                        Quên mật khẩu?
                                    </a>
                                </div>
                                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold btn-lg rounded-3 shadow-sm">
                                    Đăng Nhập
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <p className="text-muted mb-0">
                                    Chưa có tài khoản?{' '}
                                    <a href="#register" className="text-decoration-none text-primary fw-semibold">
                                        Đăng ký ngay
                                    </a>
                                </p>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;