import API from '../config/api';

// Service for handling complaint-related API calls
const complaintService = {
  // Submit a new complaint
  submitComplaint: async (formData) => {
    try {
      console.log('Starting complaint submission process');
      console.log('Submitting complaint data:', Object.fromEntries(formData.entries()));
      
      // Get authentication token if user is logged in
      const token = localStorage.getItem('token');
      
      // Add user ID to form data if user is logged in
      if (token) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user && (user.id || user._id)) {
            const userId = user.id || user._id;
            formData.append('userId', userId);
            formData.append('userIdString', userId.toString());
            console.log('Added user ID to form data:', userId);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        console.log('No authentication token found, submitting as anonymous user');
      }
      
      // Use the API instance which already has the correct baseURL and interceptors
      const response = await API.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      console.log('Server response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting complaint:', error);
      if (error.message === 'Network Error') {
        throw new Error('Network error: Could not connect to the server. Please check if the server is running.');
      }
      throw error;
    }
  },
  
  // Get complaints for the authenticated user
  getUserComplaints: async () => {
    try {
      const response = await API.get('/complaints/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      throw error;
    }
  },
  
  // Get a complaint by ID
  getComplaintById: async (complaintId) => {
    try {
      const response = await API.get(`/complaints/${complaintId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      throw error;
    }
  },

  // Get all complaints (for admin purposes)
  getAllComplaints: async () => {
    try {
      const response = await API.get('/complaints');
      return response.data;
    } catch (error) {
      console.error('Error fetching all complaints:', error);
      throw error;
    }
  },

  // Update complaint status (for admin purposes)
  updateComplaintStatus: async (complaintId, status) => {
    try {
      const response = await API.put(`/complaints/${complaintId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }
};

export default complaintService;
