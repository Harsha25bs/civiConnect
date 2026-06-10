import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [complaintData, setComplaintData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Get complaint data from session storage
    const storedData = sessionStorage.getItem('complaintData');
    
    if (storedData) {
      setComplaintData(JSON.parse(storedData));
    } else {
      // Redirect to home if no complaint data is found
      navigate('/');
    }
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'in progress':
        return <Badge bg="info">In Progress</Badge>;
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityLower = priority?.toLowerCase?.().trim?.() || 'medium';
    
    switch (priorityLower) {
      case 'low':
        return <Badge bg="success">Low</Badge>;
      case 'medium':
        return <Badge bg="warning" text="dark">Medium</Badge>;
      case 'high':
        return <Badge bg="danger">High</Badge>;
      default:
        return <Badge bg="secondary">
          {priority 
            ? priority.trim().charAt(0).toUpperCase() + priority.trim().slice(1).toLowerCase()
            : 'Medium'}
        </Badge>;
    }
  };

  if (!complaintData) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4 text-center">
          <div className="success-icon mb-4">
            {complaintData.status === 'rejected' ? (
              <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
            ) : (
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
            )}
          </div>
          
          <h2 className="mb-3">
            {complaintData.status === 'rejected' 
              ? 'Complaint Submitted but Rejected' 
              : 'Complaint Submitted Successfully!'}
          </h2>
          <p className="text-muted mb-4">
            {complaintData.status === 'rejected'
              ? 'Your complaint was automatically rejected because no proof image was provided.'
              : 'Thank you for helping improve your community. Your complaint has been received and will be reviewed shortly.'}
          </p>
          
          <Card className="mb-4 text-start border-0 bg-light">
            <Card.Body className="p-4">
              <h4 className="card-title mb-4">Complaint Details</h4>
              
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Complaint ID:</Col>
                <Col sm={8}><strong>{complaintData.complaintId}</strong></Col>
              </Row>
              
              <Row className="mb-3">
                <Col sm={4} className="text-muted">Status:</Col>
                <Col sm={8}>{getStatusBadge(complaintData.status)}</Col>
              </Row>
              
              {complaintData.category && (
                <Row className="mb-3">
                  <Col sm={4} className="text-muted">Category:</Col>
                  <Col sm={8}>{complaintData.category}</Col>
                </Row>
              )}
              
              {complaintData.priority && (
                <Row className="mb-3">
                  <Col sm={4} className="text-muted">Priority:</Col>
                  <Col sm={8}>{getPriorityBadge(complaintData.priority)}</Col>
                </Row>
              )}
              
              {complaintData.location && (
                <Row className="mb-3">
                  <Col sm={4} className="text-muted">Location:</Col>
                  <Col sm={8}>{complaintData.location}</Col>
                </Row>
              )}
              
              {complaintData.description && (
                <Row className="mb-3">
                  <Col sm={4} className="text-muted">Description:</Col>
                  <Col sm={8}>{complaintData.description}</Col>
                </Row>
              )}
              
              {complaintData.submittedAt && (
                <Row className="mb-3">
                  <Col sm={4} className="text-muted">Submitted:</Col>
                  <Col sm={8}>{formatDate(complaintData.submittedAt)}</Col>
                </Row>
              )}
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-center gap-3">
            {isAuthenticated ? (
              <>
                <Button as={Link} to="/user/dashboard" variant="primary">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Go to Dashboard
                </Button>
                <Button as={Link} to="/submit" variant="outline-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Submit Another Complaint
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/track" variant="primary">
                  <i className="bi bi-search me-2"></i>
                  Track This Complaint
                </Button>
                <Button as={Link} to="/" variant="outline-primary">
                  <i className="bi bi-house me-2"></i>
                  Return Home
                </Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SuccessPage;
