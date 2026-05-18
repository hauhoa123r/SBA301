import { Container } from "react-bootstrap";

export default function HeroFooter() {
    return (
        <footer>
            <Container fluid className="bg-light d-flex flex-column align-items-center justify-content-center">
                    <p className="text-secondary">SCR-WEB-028 -- Candidate Registration Form (UC-01.7)</p>
            </Container>
        </footer>
    );
}