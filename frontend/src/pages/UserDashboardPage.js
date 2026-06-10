import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../config/api';
import { FaSync, FaSignOutAlt, FaPlus, FaChartPie, FaClipboardList, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    'in progress': 0,
    resolved: 0,
    rejected: 0
  });

  // Define appealing colors for the application
  const colors = {
    primary: '#4e73df',
    success: '#1cc88a',
    warning: '#f6c23e',
    danger: '#e74a3b',
    info: '#36b9cc',
    secondary: '#858796',
    light: '#f8f9fc',
    dark: '#5a5c69',
    white: '#ffffff',
    cardBg: '#ffffff',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    cardHoverShadow: 'rgba(0, 0, 0, 0.15)',
    textPrimary: '#333333',
    textSecondary: '#6c757d',
    borderColor: '#e3e6f0'
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    let storedUser = null;
    
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Retrieved user from localStorage:', storedUser);
      
      // Ensure we have a valid user ID
      if (!storedUser || (!storedUser.id && !storedUser._id)) {
        console.error('Invalid user object in localStorage:', storedUser);
        navigate('/user/login');
        return;
      }
      
      // Ensure the user object has a consistent id property
      if (!storedUser.id && storedUser._id) {
        storedUser.id = storedUser._id;
        // Update localStorage with the fixed user object
        localStorage.setItem('user', JSON.stringify(storedUser));
        console.log('Updated user object in localStorage with id:', storedUser);
      }
      
      setUser(storedUser);
      
      // Set authorization header for all requests
      if (token) {
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUserComplaints();
      } else {
        navigate('/user/login');
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      navigate('/user/login');
    }
  }, [navigate]);

  // Add a new effect to refetch complaints when the component is focused
  useEffect(() => {
    // Only set up listeners if user is authenticated
    if (!user) return;
    
    // This will run when the component mounts
    const handleFocus = () => {
      console.log('Window focused - refreshing complaints');
      fetchUserComplaints();
    };

    // Add event listener for when the window regains focus
    window.addEventListener('focus', handleFocus);
    
    // Also set up an interval to periodically refresh complaints
    const intervalId = setInterval(() => {
      if (document.hasFocus()) {
        console.log('Periodic refresh - fetching complaints');
        fetchUserComplaints();
      }
    }, 10000); // Refresh every 10 seconds if the window is focused

    // Clean up
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [user]); // Depend on user to ensure this runs after user is set

  // Calculate status counts whenever complaints change
  useEffect(() => {
    if (complaints.length > 0) {
      const counts = {
        pending: 0,
        'in progress': 0,
        resolved: 0,
        rejected: 0
      };
      
      complaints.forEach(complaint => {
        const status = complaint.status.toLowerCase();
        if (counts.hasOwnProperty(status)) {
          counts[status]++;
        }
      });
      
      setStatusCounts(counts);
    }
  }, [complaints]);

  const getDemoComplaints = () => [
    {
      _id: 'demo1',
      complaintId: 'C2025458',
      category: 'pothole',
      description: 'there are many potholes in the kyatsandra service road where water gets stagnented',
      status: 'pending',
      createdAt: '2025-05-16T10:30:00Z',
      imageUrl: '/uploads/demo-pothole.jpg'
    },
    {
      _id: 'demo2',
      complaintId: 'C2025400',
      category: 'light issue',
      description: 'The street light on Pine Road has been flickering for days and now has stopped working completely.',
      status: 'pending',
      createdAt: '2025-05-11T14:45:00Z',
      imageUrl: '/uploads/demo-light.jpg'
    }
  ];

  const fetchUserComplaints = async () => {
    if (!user) {
      console.log('Cannot fetch complaints: User not available');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching user complaints...');
      console.log('User token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('User ID:', user?.id);
      console.log('User object:', JSON.stringify(user));
      
      try {
        // Direct API call to ensure we're using the latest token
        const token = localStorage.getItem('token');
        console.log('Making fetch request to: http://localhost:5000/api/user-complaints');
        const response = await fetch(`http://localhost:5000/api/user-complaints`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error('Fetch response not OK:', response.status, response.statusText);
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User complaints data (full):', JSON.stringify(data));
        
        if (data && data.success && Array.isArray(data.data)) {
          console.log('Found complaints using data.data format:', data.data.length);
          setComplaints(data.data);
          setError('');
        } else if (data && Array.isArray(data.complaints)) {
          console.log('Found complaints using data.complaints format:', data.complaints.length);
          setComplaints(data.complaints);
          setError('');
        } else if (data && Array.isArray(data)) {
          console.log('Found complaints using direct array format:', data.length);
          setComplaints(data);
          setError('');
        } else {
          console.error('Invalid complaints data format:', JSON.stringify(data));
          setComplaints([]);
          setError('Failed to load complaints: Invalid data format');
        }
      } catch (fetchError) {
        console.error('Error fetching user complaints (detailed):', fetchError.message, fetchError.stack);
        
        // If API call fails, try using axios as fallback
        try {
          console.log('Trying fallback API call with axios...');
          console.log('Axios base URL:', API.defaults.baseURL);
          console.log('Making axios request to: /user-complaints');
          const response = await API.get(`/user-complaints`);
          console.log('Fallback API response (full):', JSON.stringify(response.data));
          
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            console.log('Found complaints using axios data.data format:', response.data.data.length);
            setComplaints(response.data.data);
            setError('');
          } else if (response.data && Array.isArray(response.data.complaints)) {
            console.log('Found complaints using axios data.complaints format:', response.data.complaints.length);
            setComplaints(response.data.complaints);
            setError('');
          } else if (response.data && Array.isArray(response.data)) {
            console.log('Found complaints using axios direct array format:', response.data.length);
            setComplaints(response.data);
            setError('');
          } else {
            console.error('Invalid complaints data format from fallback:', JSON.stringify(response.data));
            // If no real complaints, show demo data for testing
            setComplaints(getDemoComplaints());
            setError('Using demo data (development only)');
          }
        } catch (axiosError) {
          console.error('Fallback API call also failed (detailed):', axiosError.message, axiosError.response?.data);
          // Show demo data for development/testing
          setComplaints(getDemoComplaints());
          setError('Using demo data (development only)');
        }
      }
    } catch (error) {
      console.error('Error in fetchUserComplaints (outer):', error.message, error.stack);
      setError(`Failed to load complaints: ${error.message}`);
      // Show demo data for development/testing
      setComplaints(getDemoComplaints());
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };
  
  const handleRefresh = () => {
    fetchUserComplaints();
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'success';
      case 'in progress': return 'info';
      case 'rejected': return 'danger';
      case 'pending': default: return 'warning';
    }
  };

  // Prepare chart data
  const chartData = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    datasets: [
      {
        data: [
          statusCounts.pending,
          statusCounts['in progress'],
          statusCounts.resolved,
          statusCounts.rejected
        ],
        backgroundColor: [
          colors.warning,
          colors.info,
          colors.success,
          colors.danger
        ],
        borderColor: [
          colors.white,
          colors.white,
          colors.white,
          colors.white
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Get total counts
  const totalComplaints = complaints.length;
  
  // Custom card style with hover effect
  const cardStyle = {
    transition: 'all 0.3s ease',
    boxShadow: `0 0.15rem 1.75rem 0 ${colors.cardShadow}`,
    backgroundColor: colors.cardBg,
    border: 'none',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    height: '100%'
  };

  // Hover effect for cards
  const cardHoverStyle = {
    ...cardStyle,
    transform: 'translateY(-5px)',
    boxShadow: `0 0.5rem 2rem 0 ${colors.cardHoverShadow}`
  };

  // Status card style
  const getStatusCardStyle = (variant) => ({
    backgroundColor: colors[variant],
    color: colors.white,
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '100%',
    boxShadow: `0 0.15rem 1.75rem 0 ${colors.cardShadow}`
  });

  return (
    <Container fluid className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0" style={{ color: colors.textPrimary, fontWeight: 700, fontSize: '1.8rem' }}>User Dashboard</h1>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={handleRefresh} style={{ borderRadius: '0.5rem' }}>
            <FaSync className="me-1" /> Refresh
          </Button>
          <Button variant="outline-danger" onClick={handleLogout} style={{ borderRadius: '0.5rem' }}>
            <FaSignOutAlt className="me-1" /> Logout
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="warning" className="mb-3" style={{ borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
          {error}
        </Alert>
      )}
      
      {/* Status Summary Cards */}
      <Row className="mb-3 g-2">
        <Col md={3} sm={6} className="mb-2 mb-md-0">
          <div 
            style={getStatusCardStyle('warning')} 
            className="h-100"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 0.5rem 2rem 0 ${colors.cardHoverShadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = `0 0.15rem 1.75rem 0 ${colors.cardShadow}`;
            }}
          >
            <div>
              <h5 className="mb-0" style={{ fontSize: '0.9rem' }}>Pending</h5>
              <h2 className="mb-0 mt-1" style={{ fontSize: '1.5rem' }}>{statusCounts.pending}</h2>
            </div>
            <FaHourglassHalf size={24} />
          </div>
        </Col>
        <Col md={3} sm={6} className="mb-2 mb-md-0">
          <div 
            style={getStatusCardStyle('info')} 
            className="h-100"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 0.5rem 2rem 0 ${colors.cardHoverShadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = `0 0.15rem 1.75rem 0 ${colors.cardShadow}`;
            }}
          >
            <div>
              <h5 className="mb-0" style={{ fontSize: '0.9rem' }}>In Progress</h5>
              <h2 className="mb-0 mt-1" style={{ fontSize: '1.5rem' }}>{statusCounts['in progress']}</h2>
            </div>
            <FaClipboardList size={24} />
          </div>
        </Col>
        <Col md={3} sm={6} className="mb-2 mb-md-0">
          <div 
            style={getStatusCardStyle('success')} 
            className="h-100"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 0.5rem 2rem 0 ${colors.cardHoverShadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = `0 0.15rem 1.75rem 0 ${colors.cardShadow}`;
            }}
          >
            <div>
              <h5 className="mb-0" style={{ fontSize: '0.9rem' }}>Resolved</h5>
              <h2 className="mb-0 mt-1" style={{ fontSize: '1.5rem' }}>{statusCounts.resolved}</h2>
            </div>
            <FaCheckCircle size={24} />
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div 
            style={getStatusCardStyle('danger')} 
            className="h-100"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 0.5rem 2rem 0 ${colors.cardHoverShadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = `0 0.15rem 1.75rem 0 ${colors.cardShadow}`;
            }}
          >
            <div>
              <h5 className="mb-0" style={{ fontSize: '0.9rem' }}>Rejected</h5>
              <h2 className="mb-0 mt-1" style={{ fontSize: '1.5rem' }}>{statusCounts.rejected}</h2>
            </div>
            <FaTimesCircle size={24} />
          </div>
        </Col>
      </Row>
      
      <Row className="g-3">
        <Col lg={4} md={5} className="mb-3">
          {/* User Profile Card */}
          <Card className="mb-3 shadow-sm" style={cardStyle}>
            <Card.Body className="p-3">
              <h4 className="mb-2" style={{ color: colors.primary, fontWeight: 600, fontSize: '1.2rem' }}>User Profile</h4>
              <div className="user-info">
                <div className="mb-2 text-center">
                  <div 
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      backgroundColor: colors.primary, 
                      color: colors.white, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: '0 auto 0.75rem'
                    }}
                  >
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <h5 className="mb-1" style={{ fontSize: '1.1rem' }}>{user?.name || user?.username}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{user?.email}</p>
                </div>
                <hr style={{ margin: '0.5rem 0' }} />
                <div className="mt-2">
                  <p className="mb-1" style={{ fontSize: '0.9rem' }}><strong>Username:</strong> {user?.username || 'N/A'}</p>
                  <p className="mb-1" style={{ fontSize: '0.9rem' }}><strong>Email:</strong> {user?.email || 'N/A'}</p>
                  <p className="mb-1" style={{ fontSize: '0.9rem' }}><strong>Account Created:</strong> N/A</p>
                  <p className="mb-1" style={{ fontSize: '0.9rem' }}><strong>Total Complaints:</strong> {totalComplaints}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          {/* Pie Chart Card */}
          <Card className="shadow-sm" style={cardStyle}>
            <Card.Body className="p-3">
              <h4 className="mb-2" style={{ color: colors.primary, fontWeight: 600, fontSize: '1.2rem' }}>
                <FaChartPie className="me-2" /> Complaint Status
              </h4>
              <div style={{ height: '240px', position: 'relative' }}>
                {totalComplaints > 0 ? (
                  <Pie data={chartData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <p className="mb-0">No data to display</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8} md={7}>
          <h2 className="mb-2" style={{ color: colors.primary, fontWeight: 600, fontSize: '1.3rem' }}>
            <FaClipboardList className="me-2" /> My Complaints
          </h2>
          
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading your complaints...</p>
            </div>
          ) : complaints.length > 0 ? (
            <div className="complaints-list">
              {complaints.map((complaint, index) => (
                <Card 
                  key={complaint._id} 
                  className="mb-3 shadow-sm" 
                  style={{
                    ...cardStyle,
                    backgroundColor: '#fff',
                    borderRadius: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0.3rem 1rem 0 ${colors.cardHoverShadow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0.15rem 1.75rem 0 ${colors.cardShadow}`;
                  }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="mb-1" style={{ color: colors.textPrimary, fontSize: '1.1rem', fontWeight: '600' }}>
                          {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
                        </h4>
                        <p className="mb-2" style={{ fontSize: '0.9rem' }}>{complaint.description}</p>
                        
                        <div className="d-flex flex-wrap text-muted small mb-0">
                          <div className="me-3">
                            <strong>ID:</strong> {complaint.complaintId}
                          </div>
                          <div className="me-3">
                            <strong>Category:</strong> {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
                          </div>
                          <div>
                            <strong>Submitted:</strong> {formatDate(complaint.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex flex-column align-items-end">
                        <Badge 
                          bg={getStatusBadgeVariant(complaint.status)} 
                          className="px-2 py-1 mb-2"
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            borderRadius: '50rem'
                          }}
                        >
                          {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </Badge>
                        
                        {complaint.imageUrl ? (
                          <div className="mt-1">
                            <img 
                              src={complaint.imageUrl.startsWith('/uploads') 
                                ? `http://localhost:5000${complaint.imageUrl}` 
                                : complaint.imageUrl}
                              alt="Complaint evidence" 
                              className="rounded" 
                              style={{ 
                                width: '100px', 
                                height: '100px', 
                                objectFit: 'cover',
                                border: `1px solid ${colors.borderColor}`,
                                boxShadow: `0 4px 6px rgba(0,0,0,0.05)`,
                                transition: 'all 0.3s ease'
                              }} 
                            />
                          </div>
                        ) : (
                          <div 
                            className="mt-1 bg-light rounded d-flex align-items-center justify-content-center" 
                            style={{ 
                              width: '100px', 
                              height: '100px',
                              border: `1px dashed ${colors.borderColor}`
                            }}
                          >
                            <span className="text-muted small">No image</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-4 rounded" 
              style={{ 
                backgroundColor: colors.light,
                borderRadius: '0.5rem',
                boxShadow: `0 0.15rem 1.75rem 0 ${colors.cardShadow}`
              }}
            >
              <div className="mb-2">
                <img src="/empty-state.svg" alt="No complaints" style={{ height: '100px', opacity: '0.5' }} />
              </div>
              <h5 style={{ color: colors.textPrimary, fontSize: '1.1rem' }}>You haven't submitted any complaints yet.</h5>
              <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>Submit a complaint to see it listed here.</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/submit')}
                style={{ 
                  borderRadius: '0.5rem',
                  padding: '0.4rem 1.2rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  fontSize: '0.9rem'
                }}
                className="mt-1"
              >
                <FaPlus className="me-1" /> Submit a Complaint
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboardPage;
