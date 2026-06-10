import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import complaintService from '../services/complaintService';

const TrackComplaintPage = () => {
  const [complaintId, setComplaintId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setComplaint(null);

    if (!complaintId.trim()) {
      setError('Please enter a complaint ID');
      setLoading(false);
      return;
    }

    try {
      const response = await complaintService.getComplaintById(complaintId.trim());
      setComplaint(response.data);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      setError(
        err.response?.status === 404
          ? 'Complaint not found. Please check the ID and try again.'
          : 'Failed to fetch complaint details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getPriorityClass = (priority) => {
    // Convert to lowercase for case-insensitive comparison and trim whitespace
    const priorityLower = priority?.toLowerCase?.().trim?.() || 'medium';
    
    switch (priorityLower) {
      case 'low':
        return 'priority-low';
      case 'medium':
        return 'priority-medium';
      case 'high':
        return 'priority-high';
      default:
        return 'priority-medium'; // fallback
    }
  };
  
  const getPriorityLabel = (priority) => {
    // Convert to lowercase for case-insensitive comparison and trim whitespace
    const priorityLower = priority?.toLowerCase?.().trim?.() || 'medium';
    
    switch (priorityLower) {
      case 'low':
        return 'Low';
      case 'medium':
        return 'Medium';
      case 'high':
        return 'High';
      default:
        // fallback: capitalize first letter of any unknown input
        return priority
          ? priority.trim().charAt(0).toUpperCase() + priority.trim().slice(1).toLowerCase()
          : 'Medium';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
      <div className="track-container">
        <h2 className="form-title">Track Your Complaint</h2>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Enter Complaint ID</Form.Label>
            <Form.Control
              type="text"
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              placeholder="e.g., CMP-12345678"
              required
            />
            <Form.Text className="text-muted">
              Enter the complaint ID you received after submission
            </Form.Text>
          </Form.Group>

          <div className="d-grid gap-2 mb-4">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Track Complaint'}
            </Button>
          </div>
        </Form>

        {error && <Alert variant="danger">{error}</Alert>}

        {complaint && (
          <div className="complaint-details">
            <h3 className="mb-4">Complaint Details</h3>
            
            <div className="mb-3">
              <strong>Complaint ID:</strong> {complaint.complaintId}
            </div>
            
            <div className="mb-3">
              <strong>Status:</strong>{' '}
              <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
              </span>
            </div>
            
            <div className="mb-3">
              <strong>Category:</strong> {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
            </div>
            
            <div className="mb-3">
              <strong>Priority:</strong>{' '}
              <span className={`priority-badge ${getPriorityClass(complaint.priority)}`}>
                {getPriorityLabel(complaint.priority)}
              </span>
            </div>
            
            <div className="mb-3">
              <strong>Description:</strong>
              <p className="mt-1">{complaint.description}</p>
            </div>
            
            <div className="mb-3">
              <strong>Location:</strong> {complaint.location}
            </div>
            
            {complaint.imageUrl && (
              <div className="mb-3">
                <strong>Image:</strong>
                <div className="mt-2">
                  <img 
                    src={complaint.imageUrl} 
                    alt="Complaint" 
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} 
                  />
                </div>
              </div>
            )}
            
            <div className="mb-3">
              <strong>Submitted On:</strong> {formatDate(complaint.createdAt)}
            </div>
            
            <div className="mb-3">
              <strong>Last Updated:</strong> {formatDate(complaint.updatedAt)}
            </div>
            
            <Card className="mt-4 bg-light">
              <Card.Body>
                <Card.Title>What happens next?</Card.Title>
                <Card.Text>
                  Your complaint has been registered in our system. Our team will review and take appropriate action.
                  You can check back here anytime to see the current status of your complaint.
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
};

export default TrackComplaintPage;
