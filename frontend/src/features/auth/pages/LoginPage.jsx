import { Container, Form, Button, Card } from 'react-bootstrap';
import HeroHeader from '../shared/component/HeroHeader';
import HeroFooter from '../shared/component/HeroFooter';
const LoginPage = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <HeroHeader />

            <Container className="flex-grow-1 d-flex align-items-center justify-content-center">
                <Card className="w-100 shadow-lg border-0" style={{ maxWidth: "550px" }}>
                    <Card.Body className="p-4 p-md-5"> 
                        <Card.Title className="fs-2 text-center mb-2 fw-bold">Welcome Back</Card.Title>
                        <Card.Text className="text-muted text-center mb-4">
                            Sign in to access your account
                        </Card.Text>
                        <div className="mx-auto" style={{ maxWidth: "420px" }}>
                            <Button variant="light" className="w-100 mb-2 border text-dark fw-semibold py-2 d-flex align-items-center justify-content-center">
                                Sign in with Google
                            </Button>
                            <Button variant="light" className="w-100 mb-3 border text-dark fw-semibold py-2 d-flex align-items-center justify-content-center">
                                Sign in with LinkedIn
                            </Button>
                            <div className="d-flex align-items-center my-4 w-100">
                                <div className="flex-grow-1 border-bottom border-secondary-subtle"></div>
                                <span className="small text-muted px-3 text-nowrap">or sign in with email</span>
                                <div className="flex-grow-1 border-bottom border-secondary-subtle"></div>
                            </div>
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label className="small fw-medium text-muted">Email Address</Form.Label>
                                    <Form.Control className="border py-2" type="email" placeholder="Enter email" defaultValue="candidate@example.com" />
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="formBasicPassword">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="small fw-medium text-muted mb-0">Password</Form.Label>
                                        <a href="/forgot-password" className="text-decoration-none small fw-medium" style={{ color: "#5045E6" }}>
                                            Forget password?
                                        </a>
                                    </div>
                                    <Form.Control className="border py-2" type="password" placeholder="Enter password" defaultValue="********" />
                                </Form.Group>
                                <Button className="w-100 py-2 fw-semibold" style={{ backgroundColor: "#5045E6", borderColor: "#5045E6" }}>
                                    Sign In
                                </Button>
                            </Form>
                            <div className="text-center mt-4">
                                <p className="text-muted small mb-0">
                                    Don't have an account?{' '}
                                    <a href="/register" className="text-decoration-none fw-semibold" style={{ color: "#5045E6" }}>
                                        Register
                                    </a>
                                </p>
                            </div>
                        </div> 
                    </Card.Body>
                </Card>
            </Container>
            <HeroFooter />
        </div>
    );
};

export default LoginPage;