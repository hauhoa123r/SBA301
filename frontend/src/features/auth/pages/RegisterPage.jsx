import { Button, Card, Container, Form } from "react-bootstrap";
import HeroHeader from "../shared/component/HeroHeader";
import HeroFooter from "../shared/component/HeroFooter";

export default function RegisterPage() {
    return (
        <Container className="d-flex flex-column min-vh-100" fluid>
            <HeroHeader />
            <Container className="flex-grow-1 my-4 d-flex align-items-center justify-content-center">
                <Card className="w-100 shadow-lg" style={{ maxWidth: "550px" }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                        <Card.Title className="fs-2 fw-bold text-center mb-2">Create an Account</Card.Title>
                        <Card.Text>
                            Join our talent community to track your applications
                        </Card.Text>
                        <Button variant="light" className="w-100 mb-2 border text-dark fw-semibold" style={{ maxWidth: "450px" }}>Continue with Google</Button>
                        <Button variant="light" className="w-100 mb-2 border text-dark fw-semibold" style={{ maxWidth: "450px" }}>Continue with LinkedIn</Button>
                        <Card.Text className="small text-muted my-2">or register with email</Card.Text>
                        <Form.Group className="w-100" style={{ maxWidth: "450px" }} controlId="formBasicFullName">
                            <Form.Label className="small fw-semibold text-muted text-start d-block">Full Name</Form.Label>
                            <Form.Control type="text" placeholder="e.g Nguyen Van A" className="py-2" />
                        </Form.Group>
                        <Form.Group className="w-100 mt-3" style={{ maxWidth: "450px" }} controlId="formBasicEmail">
                            <Form.Label className="small fw-semibold text-muted text-start d-block">Email Address</Form.Label>
                            <Form.Control type="email" placeholder="e.g example@email.com" className="py-2" />
                        </Form.Group>
                        <Form.Group className="w-100 mt-3" style={{ maxWidth: "450px" }} controlId="formBasicPassword">
                            <Form.Label className="small fw-semibold text-muted text-start d-block">Password</Form.Label>
                            <Form.Control type="password" placeholder="*********" className="py-2" />
                        </Form.Group>
                        <Button className="w-100 mt-4" style={{ maxWidth: "450px", backgroundColor: "#5045E6", borderColor: "#5045E6" }}>
                            Create Account
                        </Button>
                        <div className="text-center mt-3">
                            <p className="text-muted mb-0">
                                Already have an account?{' '}
                                <a href="/login" className="text-decoration-none fw-semibold" style={{ color: "#5045E6" }}>
                                    Sign In
                                </a>
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
            <HeroFooter />
        </Container>
    );
}