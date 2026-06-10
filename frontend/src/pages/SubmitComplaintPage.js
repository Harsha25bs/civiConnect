import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import complaintService from '../services/complaintService';

const SubmitComplaintPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: '',
    priority: 'medium',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [formValid, setFormValid] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page with a return URL
      navigate('/user/login', { 
        state: { 
          returnUrl: '/submit',
          message: 'Please log in to submit a complaint'
        } 
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Check form validity
    validateForm();
  };

  const validateForm = () => {
    const isValid = formData.category && formData.description && formData.location && formData.priority && formData.image;
    setFormValid(isValid);
    return isValid;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setFormStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    setFormStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('Starting complaint submission in component');

    // Validate form
    if (!validateForm()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Create form data for file upload
    const submitData = new FormData();
    submitData.append('category', formData.category);
    submitData.append('description', formData.description);
    submitData.append('location', formData.location);
    submitData.append('priority', formData.priority);
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      console.log('Calling complaintService.submitComplaint');
      const response = await complaintService.submitComplaint(submitData);
      console.log('Submission response received:', response);

      // Store complaint ID in session storage for success page
      // Check if the data is nested in a 'data' property
      const complaintData = response.data || response;
      console.log('Processed complaint data:', complaintData);
      
      // Store more comprehensive data for the success page
      sessionStorage.setItem('complaintData', JSON.stringify({
        complaintId: complaintData.complaintId,
        status: complaintData.status,
        category: formData.category,
        description: formData.description.substring(0, 100) + (formData.description.length > 100 ? '...' : ''),
        location: formData.location,
        priority: formData.priority,
        submittedAt: new Date().toISOString(),
        isAuthenticated: !!localStorage.getItem('token')
      }));

      console.log('Navigating to success page');
      // Navigate to success page
      navigate('/success');
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.message || 'Failed to submit complaint. Please try again.');
      setFormStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Category icons mapping
  const categoryIcons = {
    'pothole': 'bi-exclamation-triangle',
    'water stagnation': 'bi-droplet',
    'light issue': 'bi-lightbulb',
    'other': 'bi-question-circle'
  };

  return (
    <Container className="py-5">
      <div className="form-container">
        <h2 className="form-title">Submit a Civic Complaint</h2>
        
        {error && <Alert variant="danger"><i className="bi bi-exclamation-circle-fill me-2"></i>{error}</Alert>}
        
        {formStep === 1 ? (
          // Step 1: Complaint Details Form
          <Form>
            <div className="mb-4 text-center">
              <div className="d-flex justify-content-center mb-4">
                <div className="position-relative">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                    <i className="bi bi-1-circle-fill"></i>
                  </div>
                  <div className="mt-2">Details</div>
                </div>
                <div className="border-top border-2 w-25 position-relative" style={{top: '20px'}}></div>
                <div className="position-relative">
                  <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                    <i className="bi bi-2-circle"></i>
                  </div>
                  <div className="mt-2">Review</div>
                </div>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="required-field">Category</Form.Label>
              <Form.Select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select a category</option>
                <option value="pothole">Pothole</option>
                <option value="water stagnation">Water Stagnation</option>
                <option value="light issue">Street Light Issue</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="required-field">Priority</Form.Label>
              <Form.Select 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
              <Form.Text className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Select the urgency level of your complaint.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="required-field">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe the issue in detail"
                required
              />
              <Form.Text className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Provide as much detail as possible to help us address the issue effectively.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="required-field">Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter the location of the issue"
                required
              />
              <Form.Text className="text-muted">
                <i className="bi bi-geo-alt me-1"></i>
                Please provide a specific address or landmark for accurate identification.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                <i className="bi bi-image me-2"></i>
                Upload Image <span className="text-danger">*</span>
                <span className="text-danger ms-2">(Required - complaints without proof images will be automatically rejected)</span>
              </Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              <Form.Text className="text-muted">
                Please upload a clear image showing the issue. Maximum file size: 5MB.
              </Form.Text>
              {!formData.image && (
                <Alert variant="warning" className="mt-2">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  An image proof is required. Complaints without images will be automatically rejected.
                </Alert>
              )}
              {imagePreview && (
                <div className="image-preview-container mt-3">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                onClick={handleNextStep}
                size="lg" 
                disabled={!formValid}
              >
                Next Step <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </div>
          </Form>
        ) : (
          // Step 2: Review and Submit
          <div>
            <div className="mb-4 text-center">
              <div className="d-flex justify-content-center mb-4">
                <div className="position-relative">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <div className="mt-2">Details</div>
                </div>
                <div className="border-top border-2 w-25 position-relative" style={{top: '20px'}}></div>
                <div className="position-relative">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                    <i className="bi bi-2-circle-fill"></i>
                  </div>
                  <div className="mt-2">Review</div>
                </div>
              </div>
            </div>

            <Card className="mb-4">
              <Card.Header as="h5">
                <i className={`bi ${categoryIcons[formData.category] || 'bi-file-text'} me-2`}></i>
                Review Your Complaint
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Category:</Col>
                  <Col md={8} className="text-capitalize">{formData.category}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Priority:</Col>
                  <Col md={8} className="text-capitalize">{formData.priority}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Description:</Col>
                  <Col md={8}>{formData.description}</Col>
                </Row>
                <Row className="mb-3">
                  <Col md={4} className="fw-bold">Location:</Col>
                  <Col md={8}>{formData.location}</Col>
                </Row>
                {imagePreview && (
                  <Row className="mb-3">
                    <Col md={4} className="fw-bold">Image:</Col>
                    <Col md={8}>
                      <div className="image-preview-container" style={{maxWidth: '300px'}}>
                        <img src={imagePreview} alt="Complaint" />
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            <div className="d-flex gap-2 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handlePrevStep}
                className="px-4"
              >
                <i className="bi bi-arrow-left me-2"></i> Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                className="px-4 ms-auto"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Complaint <i className="bi bi-send ms-2"></i>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default SubmitComplaintPage;