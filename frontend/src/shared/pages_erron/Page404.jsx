
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   House, 
//   Book, 
//   Mortarboard, 
//   Tv, 
//   Translate, 
//   Headset 
// } from 'react-bootstrap-icons';


const Page404 = () => {
  const navigate = useNavigate();

 return (
    <Container className=" d-flex align-items-center py-5">
      <Row className="w-100 align-items-center">
        
       
        <Col md={6} className="text-start ps-md-5">
          <h1 
            className="fw-bold m-0" 
            style={{ 
              fontSize: '8rem', 
              background: 'linear-gradient(45deg, #6f42c1, #a985e5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            404
          </h1>
          
          <h2 className="fw-bold mb-3" style={{ color: '#1e1e2f', fontSize: '2.5rem' }}>
            Oops! This page <br />
            got lost in <span style={{ color: '#6f42c1' ,fontSize:'50px'}}>translation.</span>
          </h2>
          
          <p className="text-muted mb-4" style={{ fontSize: '1.1rem', maxWidth: '450px' }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track!
          </p>

         
          <div className="d-flex gap-3 mb-5">
            <Button 
              onClick={() => navigate("#")}
              className="px-4 py-2 d-flex align-items-center gap-2 border-0"
              style={{ backgroundColor: '#6f42c1', borderRadius: '10px' }}
            >
             Go Back
            </Button>
            <Button 
              onClick={() => navigate('#')}
              variant="outline-secondary"
              className="px-4 py-2 d-flex align-items-center gap-2"
              style={{ borderRadius: '10px', color: '#6f42c1', borderColor: '#e2d9f3' }}
            >
               Back to Home
            </Button>
          </div>

         
          <div className="p-4 mb-4" style={{ backgroundColor: '#f5f0fc', borderRadius: '15px', maxWidth: '500px' }}>
            <p className="text-muted small fw-bold mb-3">Maybe you were looking for:</p>
            <Row className="g-2 text-secondary small fw-medium">
              <Col xs={6} className="d-flex align-items-center gap-2 custom-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/courses')}>
                keyword 
              </Col>
              <Col xs={6} className="d-flex align-items-center gap-2 custom-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/my-learning')}>
               keyword
              </Col>
              
              <Col xs={6} className="d-flex align-items-center gap-2 custom-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/vocabulary')}>
                 keyword
              </Col>
            </Row>
          </div>

          
          <div className="d-flex align-items-center justify-content-between p-3 border border-1" style={{ borderRadius: '15px', maxWidth: '500px', backgroundColor: '#fff' }}>
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-circle" style={{ backgroundColor: '#f5f0fc' }}>
              
              </div>
              <div>
                <div className="fw-bold small">Still need help?</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Our support team is here for you.</div>
              </div>
            </div>
            <Button variant="outline-secondary" size="sm" style={{ borderRadius: '8px', fontSize: '0.85rem' }}>Contact Support</Button>
          </div>

        </Col>

       
        <Col md={6} className="text-center mt-4 mt-md-0">
          <img 
            src="courses/image_404.png" 
            alt="Lost in translation illustration" 
            className="img-fluid"
            style={{ maxHeight: '100%', objectFit: 'contain' }}
          />
        </Col>

      </Row>
    </Container>
  );
};

export default Page404;