import { Container, Nav, Navbar } from "react-bootstrap";

export default function HeroHeader() {
    const navigationLinks = [
        { name: "Jobs", path: "/jobs" },
        { name: "About Us", path: "/about" },
        { name: "Sign In", path: "/register" }
    ];
    const currentPath = window.location.pathname;
    return (
        <Navbar expand="xl" className="bg-light navbar-light shadow-sm">
            <Container>
                <Navbar.Brand href="/login">Logo</Navbar.Brand>
                <Navbar.Text className="me-3">TechCorp Careers</Navbar.Text>
                <Navbar.Toggle aria-controls="hero-navbar-nav" />
                <Navbar.Collapse id="hero-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        {navigationLinks.map((link, index) => {
                            const isActive = currentPath === link.path;
                            return (
                                <Nav.Link
                                    key={index}
                                    href={link.path}
                                    className="px-3"
                                    style={{
                                        color: isActive ? "#5145E4" : "",
                                        fontWeight: isActive ? "600" : "normal"
                                    }}>
                                    {link.name}
                                </Nav.Link>
                            );
                        })}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}