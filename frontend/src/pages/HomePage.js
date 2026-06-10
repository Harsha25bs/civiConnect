import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <>
      <div className="hero-section">
        <Container>
          <h1>Welcome to <span className="fw-bold">civiC</span>Connect</h1>
          <p>
            A smart platform that empowers citizens to report civic issues and track their resolution.
            Help improve your community by submitting complaints about infrastructure problems.
          </p>
        </Container>
      </div>

      <Container>
        <h2 className="text-center mb-4">How It Works</h2>
        <Row className="equal-height-cards">
          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="mb-3 text-center">
                  <i className="bi bi-file-earmark-text fs-1"></i>
                </div>
                <Card.Title className="text-center">Submit a Complaint</Card.Title>
                <Card.Text className="flex-grow-1">
                  Select a category, provide details about the issue, upload an image, and specify the location.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="mb-3 text-center">
                  <i className="bi bi-clipboard-check fs-1"></i>
                </div>
                <Card.Title className="text-center">Get a Unique ID</Card.Title>
                <Card.Text className="flex-grow-1">
                  Receive a unique complaint ID that you can use to track the status of your complaint.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card h-100">
              <Card.Body className="d-flex flex-column">
                <div className="mb-3 text-center">
                  <i className="bi bi-graph-up fs-1"></i>
                </div>
                <Card.Title className="text-center">Track Progress</Card.Title>
                <Card.Text className="flex-grow-1">
                  Use your complaint ID to track the status and progress of your complaint resolution.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center mt-5">
          {isAuthenticated ? (
            <Link 
              to="/submit" 
              className="btn btn-primary btn-lg me-3"
            >
              Submit a Complaint
            </Link>
          ) : (
            <Link 
              to="/user/login" 
              state={{ returnUrl: '/submit', message: 'Please log in to submit a complaint' }}
              className="btn btn-primary btn-lg me-3"
            >
              Submit a Complaint
            </Link>
          )}
          <Link 
            to="/track" 
            className="btn btn-outline-primary btn-lg"
          >
            Track Your Complaint
          </Link>
        </div>
        
        <div className="text-center mt-4">
          {isAuthenticated ? (
            <Link 
              to="/user/dashboard" 
              className="btn btn-link text-primary me-3"
            >
              <i className="bi bi-speedometer2 me-1"></i>
              My Dashboard
            </Link>
          ) : (
            <Link 
              to="/user/login" 
              className="btn btn-link text-primary me-3"
            >
              <i className="bi bi-person-circle me-1"></i>
              User Login
            </Link>
          )}
          <Link 
            to="/admin/login" 
            className="btn btn-link text-muted"
          >
            <i className="bi bi-shield-lock me-1"></i>
            Admin Login
          </Link>
        </div>
      </Container>
    </>
  );
};

export default HomePage;
