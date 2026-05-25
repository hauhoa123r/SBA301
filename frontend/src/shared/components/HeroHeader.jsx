import { Button, Container, Nav, Navbar } from "react-bootstrap";
import "../../styles/narbar/narbar.css"
export default function HeroHeader() {
    const navigationLinks = [
        { name: "Home", path: "/jobs" },
        { name: "About", path: "/about" },
        { name: "Course", path: "/register" },
        { name: "Blog", path: "/blog" },
        { name: "Contact", path: "/contact" }
    ];
    const currentPath = window.location.pathname;
    return (
        <Navbar expand="xl" className="navbar-light shadow-sm">
            <Container>
                <Navbar.Brand href="/">
                    <img
                        src="/images/logo-removebg-preview.png"
                        alt="Logo"
                        width="70"
                        height="40"
                    />
                </Navbar.Brand>
                <Navbar.Text
                    className="me-3"
                    style={{
                        fontFamily: "Sora",
                        fontWeight: 700,
                        fontSize: "24px",
                        letterSpacing: "-0.8px",
                        color: "#050215"
                    }}
                >
                    ChinCareer
                </Navbar.Text>
                <Navbar.Toggle aria-controls="hero-navbar-nav" />
                <Navbar.Collapse id="hero-navbar-nav">

                    <Nav className="mx-auto align-items-center">
                        {navigationLinks.map((link, index) => {
                            const isActive = currentPath === link.path;
                            return (
                                <Nav.Link
                                    key={index}
                                    href={link.path}
                                    className={`nav-link-custom px-3 fw-semibold ${isActive ? "active-nav-link" : ""
                                        }`}
                                >
                                    {link.name}
                                </Nav.Link>
                            );
                        })}
                    </Nav>
                    <div className="d-flex gap-2">
                        <Button variant="outline-light rounded-5 border-0" className="login-btn px-4 fw-semibold" style={{fontSize: "14px", color: "#5145E4", borderColor: "#5145E4"}} >
                            Login
                        </Button>
                        <Button variant="outline-light" style={{ backgroundColor: "#5145E4", border: "none", fontSize: "14px" }} className="start-btn fw-semibold rounded-5" >Get Started</Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}