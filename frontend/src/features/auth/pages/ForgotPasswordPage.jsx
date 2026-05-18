import { Button, Card, Container, Form } from "react-bootstrap";
import HeroHeader from "../shared/component/HeroHeader";
import HeroFooter from "../shared/component/HeroFooter";

export default function ForgotPasswordPage() {
    return (
        <Container className="d-flex flex-column min-vh-100" fluid>
            <HeroHeader></HeroHeader>
            <Container className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Card className="w-100 shadow-lg" style={{ maxWidth: "550px" }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                        <Card.Title className="fs-4 text-center">Icon</Card.Title>
                        <Card.Title className="text-center mt-5">Reset your password</Card.Title>
                        <Card.Text className="small text-muted text-center">
                            Enter your email address and we'll send you a link to reset your password.
                        </Card.Text>
                        <Form className="mt-3 w-100 d-flex flex-column align-items-center">
                            <Form.Group controlId="formBasicEmail" className="w-100" style={{ maxWidth: "450px" }}>
                                <Form.Label className="fw-semibold">
                                    Email address
                                </Form.Label> 
                                <Form.Control type="email" placeholder="candidate@example.com" />
                            </Form.Group>
                            <Button
                                type="submit" className="w-100 mt-5" style={{maxWidth: "450px",color: "#fff",backgroundColor: "#5045E6",borderColor: "#5045E6"}}>Send Reset Link
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
            <HeroFooter></HeroFooter>
        </Container>

    )
};