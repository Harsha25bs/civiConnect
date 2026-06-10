import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../config/api';
import ComplaintStatusChart from '../components/ComplaintStatusChart';
import ComplaintCategoryChart from '../components/ComplaintCategoryChart';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [priorityUpdate, setPriorityUpdate] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    category: ''
  });

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      // Set authorization header for all requests
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchComplaints();
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedComplaint) {
      setStatusUpdate(selectedComplaint.status);
      setPriorityUpdate(selectedComplaint.priority);
    }
  }, [selectedComplaint]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await API.get('complaints');
      setComplaints(response.data.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to fetch complaints. Please try again.');
      if (err.response?.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const handleStatusChange = (e) => {
    setStatusUpdate(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriorityUpdate(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !statusUpdate) return;

    try {
      console.log('Updating complaint status:', selectedComplaint.complaintId, 'to', statusUpdate);
      const response = await API.put(`complaints/${selectedComplaint.complaintId}`, { status: statusUpdate });
      console.log('Update response:', response);
      
      // Update local state
      setComplaints(complaints.map(c => 
        c.complaintId === selectedComplaint.complaintId 
          ? { ...c, status: statusUpdate } 
          : c
      ));
      
      setSelectedComplaint({
        ...selectedComplaint,
        status: statusUpdate
      });
      
      setUpdateSuccess('Status updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const handleUpdatePriority = async () => {
    if (!selectedComplaint || !priorityUpdate) return;

    try {
      console.log('Updating complaint priority:', selectedComplaint.complaintId, 'to', priorityUpdate);
        const response = await API.put(`complaints/${selectedComplaint.complaintId}`, { priority: priorityUpdate });
      console.log('Update response:', response);
      
      // Update local state
      setComplaints(complaints.map(c => 
        c.complaintId === selectedComplaint.complaintId 
          ? { ...c, priority: priorityUpdate } 
          : c
      ));
      
      setSelectedComplaint({
        ...selectedComplaint,
        priority: priorityUpdate
      });
      
      setUpdateSuccess('Priority updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating priority:', err);
      setError('Failed to update priority. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilter({
      status: '',
      priority: '',
      category: ''
    });
  };

  // Apply filters to complaints
  const filteredComplaints = complaints.filter(complaint => {
    return (
      (filter.status === '' || complaint.status === filter.status) &&
      (filter.priority === '' || complaint.priority === filter.priority) &&
      (filter.category === '' || complaint.category === filter.category)
    );
  });

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
    // Convert to lowercase for case-insensitive comparison and trim whitespace
    const priorityLower = priority?.toLowerCase?.().trim?.() || 'medium';
    
    switch (priorityLower) {
      case 'low':
        return <Badge bg="success">Low</Badge>;
      case 'medium':
        return <Badge bg="warning" text="dark">Medium</Badge>;
      case 'high':
        return <Badge bg="danger">High</Badge>;
      default:
        // Show the actual priority value if it doesn't match any case
        return <Badge bg="secondary">
          {priority 
            ? priority.trim().charAt(0).toUpperCase() + priority.trim().slice(1).toLowerCase()
            : 'Unknown'}
        </Badge>;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Admin Dashboard</h2>
          <p className="text-muted">Manage and track all complaints</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Analytics Section with 3D Charts */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-bar-chart-fill me-2"></i>
                Complaint Analytics
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Complaints by Status</h6>
                    </Card.Header>
                    <Card.Body>
                      {!loading && complaints.length > 0 ? (
                        <ComplaintStatusChart complaints={complaints} />
                      ) : (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Top Complaint Categories</h6>
                    </Card.Header>
                    <Card.Body>
                      {!loading && complaints.length > 0 ? (
                        <ComplaintCategoryChart complaints={complaints} />
                      ) : (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Filter Complaints</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      name="status" 
                      value={filter.status} 
                      onChange={handleFilterChange}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select 
                      name="priority" 
                      value={filter.priority} 
                      onChange={handleFilterChange}
                    >
                      <option value="">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select 
                      name="category" 
                      value={filter.category} 
                      onChange={handleFilterChange}
                    >
                      <option value="">All Categories</option>
                      <option value="pothole">Pothole</option>
                      <option value="water stagnation">Water Stagnation</option>
                      <option value="light issue">Street Light Issue</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button 
                    variant="secondary" 
                    className="mb-3" 
                    onClick={resetFilters}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Reset Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={selectedComplaint ? 8 : 12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">All Complaints ({filteredComplaints.length})</h5>
            </Card.Header>
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No complaints found
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <tr key={complaint.complaintId}>
                        <td>{complaint.complaintId}</td>
                        <td className="text-capitalize">{complaint.category}</td>
                        <td>{getPriorityBadge(complaint.priority)}</td>
                        <td>{complaint.location}</td>
                        <td>{getStatusBadge(complaint.status)}</td>
                        <td>{formatDate(complaint.createdAt)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleViewComplaint(complaint)}
                          >
                            <i className="bi bi-eye-fill me-1"></i>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>

        {selectedComplaint && (
          <Col md={4}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Complaint Details</h5>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setSelectedComplaint(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </Button>
              </Card.Header>
              <Card.Body>
                {updateSuccess && (
                  <Alert variant="success">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {updateSuccess}
                  </Alert>
                )}
                
                <div className="mb-3">
                  <strong>Complaint ID:</strong> {selectedComplaint.complaintId}
                </div>
                
                <div className="mb-3">
                  <strong>Status:</strong>{' '}
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                
                <div className="mb-3">
                  <strong>Category:</strong>{' '}
                  <span className="text-capitalize">{selectedComplaint.category}</span>
                </div>
                
                <div className="mb-3">
                  <strong>Priority:</strong>{' '}
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
                
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p className="mt-1">{selectedComplaint.description}</p>
                </div>
                
                <div className="mb-3">
                  <strong>Location:</strong> {selectedComplaint.location}
                </div>
                
                {selectedComplaint.imageUrl && (
                  <div className="mb-3">
                    <strong>Image:</strong>
                    <div className="mt-2">
                      <img 
                        src={selectedComplaint.imageUrl} 
                        alt="Complaint" 
                        className="img-fluid rounded" 
                      />
                    </div>
                  </div>
                )}
                
                <div className="mb-3">
                  <strong>Submitted On:</strong> {formatDate(selectedComplaint.createdAt)}
                </div>
                
                <div className="mb-3">
                  <strong>Last Updated:</strong> {formatDate(selectedComplaint.updatedAt)}
                </div>
                
                <hr />
                
                <div className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Update Status</strong></Form.Label>
                    <Form.Select 
                      value={statusUpdate} 
                      onChange={handleStatusChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                
                <div className="mb-3">
                  <Form.Group>
                    <Form.Label><strong>Update Priority</strong></Form.Label>
                    <Form.Select 
                      value={priorityUpdate} 
                      onChange={handlePriorityChange}
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    onClick={handleUpdateStatus}
                    disabled={statusUpdate === selectedComplaint.status}
                  >
                    <i className="bi bi-check2-circle me-2"></i>
                    Update Status
                  </Button>
                </div>
                
                <div className="d-grid mt-3">
                  <Button 
                    variant="primary" 
                    onClick={handleUpdatePriority}
                    disabled={priorityUpdate === selectedComplaint.priority}
                  >
                    <i className="bi bi-check2-circle me-2"></i>
                    Update Priority
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default AdminDashboardPage;
