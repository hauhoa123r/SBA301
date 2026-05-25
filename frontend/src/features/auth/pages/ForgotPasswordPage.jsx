import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import HeroHeader from "../../../shared/components/HeroHeader.jsx";
import HeroFooter from "../../../shared/components/HeroFooter";
import { validInput } from "../../../shared/utils/inputHandler.js";
import { forgotPassword } from "../service/authService.js";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
    const [formData, setFormData] = useState({ email: "", token: "" });
    const [errors, setErrors] = useState({ email: "", token: "" });
    const [loading, setLoading] = useState(false);
    const [showTokenModel, setShowTokenModel] = useState(false);

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
        if (emailError) {
            setErrors({ email: emailError });
            return;
        }

        try {
            setLoading(true);
            const response = await forgotPassword({ email: formData.email });
            toast.success(response.message || "Gửi liên kết đặt lại mật khẩu thành công");
            setShowTokenModel(true);
        } catch (err) {
            toast.error(err?.response?.data?.error || "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleTokenSubmit = (e) => {
        e.preventDefault();
        const tokenError = validInput("token", formData.token);
        if (tokenError) {
            setErrors({ ...errors, token: tokenError });
            return;
        }
        try {
            setLoading(true);
            toast.success("Xác thực thành công. Đang chuyển hướng...");
            // Redict to reset password page with token
            //......................................................................................................

        } catch (err) {
            toast.error(err?.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container className="d-flex flex-column min-vh-100" fluid>
            <HeroHeader />
            <Container className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Card className="w-100 shadow-lg" style={{ maxWidth: "550px" }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                        <Card.Title className="fs-4 text-center">
                            {showTokenModel ? "Reset your password" : "Enter Secrity Token"}
                        </Card.Title>
                        <Card.Text className="small text-muted text-center">
                            {
                                !showTokenModel
                                    ? "Enter your email address and we'll send you a link to reset your password."
                                    : `We have send you a security token to ${formData.email}. Please checkup and enter the token here to reset your password.`
                            }
                        </Card.Text>
                        {!showTokenModel ? (
                            <Form className="mt-3 w-100 d-flex flex-column align-items-center" onSubmit={handleSubmit}>
                                <Form.Group controlId="formBasicEmail" className="w-100" style={{ maxWidth: "450px" }}>
                                    <Form.Label className="fw-semibold">
                                        Email address
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="candidate@example.com" />
                                    {errors.email && <Form.Text className="text-danger fw-semibold">{errors.email}</Form.Text>}
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="w-100 mt-5"
                                    style={{ maxWidth: "450px", color: "#fff", backgroundColor: "#5045E6", borderColor: "#5045E6" }}
                                    disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </Form>
                        ) : (
                            <Form className="mt-3 w-100 d-flex flex-column align-items-center" onSubmit={handleTokenSubmit}>
                                <Form.Group controlId="formBasicEmail" className="w-100" style={{ maxWidth: "450px" }}>
                                    <Form.Label className="fw-semibold">
                                        Enter Security Token
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="token"
                                        value={formData.token}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter token" />
                                    {errors.token && <Form.Text className="text-danger fw-semibold">{errors.token}</Form.Text>}
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="w-100 mt-5"
                                    style={{ maxWidth: "450px", color: "#fff", backgroundColor: "#5045E6", borderColor: "#5045E6" }}
                                    disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>
                                <Button
                                    variant="link"
                                    className="mt-3 text-muted text-decoration-none"
                                    onClick={() => setShowTokenModel(false)}>
                                    Return to use difference email ?
                                </Button>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            </Container>
            <HeroFooter />
        </Container>
    );
}