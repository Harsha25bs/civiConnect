import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <h5><span className="fw-bold">civiC</span>Connect</h5>
            <p className="mb-0">A Smart Civic Complaint and Feedback System</p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">© {currentYear} civiCConnect. All rights reserved.</p>
            <p className="mb-0">Empowering citizens to improve their communities.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
