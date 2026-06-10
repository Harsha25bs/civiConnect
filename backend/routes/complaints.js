const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Complaint = require('../models/Complaint');
const fs = require('fs');
const { auth, admin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware for multer
const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB.'
          });
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }
    next();
  });
};

// POST - Submit a new complaint
router.post('/', uploadMiddleware, async (req, res) => {
  try {
    // Extract form data
    const { category, description, location, priority } = req.body;
    
    // Validate required fields
    if (!category || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, description, and location'
      });
    }
    
    // Generate a unique complaint ID
    const complaintId = `CMP-${uuidv4().substring(0, 8).toUpperCase()}`;
    console.log('Generated complaint ID:', complaintId);
    
    // Check for authentication token
    let userId = null;
    let userIdString = null;
    
    // First check if userId was explicitly provided in the form data
    if (req.body.userId) {
      console.log('User ID provided in form data:', req.body.userId);
      userIdString = req.body.userId.toString();
      
      // Convert to ObjectId if valid
      if (mongoose.Types.ObjectId.isValid(req.body.userId)) {
        userId = new mongoose.Types.ObjectId(req.body.userId);
        console.log('Converted user ID to ObjectId:', userId);
      } else {
        userId = req.body.userId;
        console.log('Using user ID as is (not a valid ObjectId):', userId);
      }
    }
    // If not in form data, try to get from auth token
    else if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        console.log('Authorization token received:', token.substring(0, 20) + '...');
        const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
        
        // Get userId from token
        userIdString = decoded.id.toString();
        
        // Convert to ObjectId if valid
        if (mongoose.Types.ObjectId.isValid(decoded.id)) {
          userId = new mongoose.Types.ObjectId(decoded.id);
          console.log('Extracted and converted user ID from token:', userId);
        } else {
          userId = decoded.id;
          console.log('Using user ID from token as is:', userId);
        }
      } catch (authError) {
        console.error('Authentication error:', authError);
        console.log('Invalid authentication token, continuing as anonymous user');
      }
    } else {
      console.log('No authorization header found, continuing as anonymous user');
    }
    
    // Create a new complaint
    const complaint = new Complaint({
      complaintId,
      category,
      description,
      location,
      priority: priority || 'medium', // Use provided priority or default to medium
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      // Automatically set status to rejected if no image is provided
      status: req.file ? 'pending' : 'rejected',
      // Associate with user if authenticated
      userId: userId,
      // Store userId as string as well for easier querying
      userIdString: userIdString
    });
    
    console.log('Complaint object before save:', complaint);
    
    try {
      await complaint.save();
      console.log('Complaint saved successfully:', {
        complaintId: complaint.complaintId,
        status: complaint.status
      });
      
      res.status(201).json({
        success: true,
        data: {
          complaintId: complaint.complaintId,
          status: complaint.status
        },
        message: 'Complaint submitted successfully'
      });
    } catch (saveError) {
      console.error('Error saving complaint to database:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving complaint to database',
        error: saveError.message
      });
    }
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting complaint',
      error: error.message
    });
  }
});

// GET - Fetch all complaints for the authenticated user
router.get('/user', auth, async (req, res) => {
  try {
    console.log('GET /complaints/user route called');
    
    // Get the user ID from the authenticated request
    const userId = req.user.id || req.user._id;
    console.log('User ID from request:', userId);
    console.log('User object from request:', JSON.stringify(req.user));
    
    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Convert userId to string for consistent comparison
    const userIdString = userId.toString();
    console.log('User ID as string:', userIdString);
    
    // First, let's update any existing complaints that might not have userIdString set
    try {
      const updateResult = await Complaint.updateMany(
        { 
          userId: new mongoose.Types.ObjectId(userId), 
          $or: [
            { userIdString: { $exists: false } },
            { userIdString: null }
          ]
        },
        { $set: { userIdString: userIdString } }
      );
      
      console.log('Updated existing complaints:', updateResult);
    } catch (updateError) {
      console.error('Error updating existing complaints:', updateError);
      // Continue with the query even if update fails
    }
    
    // Now search with all possible formats
    try {
      console.log('Searching for complaints with userId:', userId, 'or userIdString:', userIdString);
      
      const complaints = await Complaint.find({ 
        $or: [
          { userId: new mongoose.Types.ObjectId(userId) },
          { userIdString: userIdString }
        ]
      }).sort({ createdAt: -1 });
      
      console.log('Found complaints:', complaints.length);
      
      if (complaints.length === 0) {
        // If no complaints found, let's check if there are any complaints at all
        const totalComplaints = await Complaint.countDocuments();
        console.log('Total complaints in database:', totalComplaints);
        
        // Let's also check a few complaints to see what userIds they have
        if (totalComplaints > 0) {
          const sampleComplaints = await Complaint.find().limit(3);
          console.log('Sample complaints userIds:', sampleComplaints.map(c => ({ 
            complaintId: c.complaintId, 
            userId: c.userId,
            hasUserId: !!c.userId,
            userIdType: c.userId ? typeof c.userId : 'undefined',
            userIdString: c.userIdString || 'not set',
            userIdMatches: c.userId && c.userId.toString() === userIdString,
            userIdStringMatches: c.userIdString === userIdString
          })));
        }
      }
      
      // Return the complaints even if empty array
      return res.status(200).json({
        success: true,
        count: complaints.length,
        data: complaints
      });
    } catch (dbError) {
      console.error('Database error when fetching complaints:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error when fetching complaints',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user complaints',
      error: error.message
    });
  }
});

// GET - Fetch complaint status by ID
router.get('/:complaintId', async (req, res) => {
  try {
    const { complaintId } = req.params;
    
    const complaint = await Complaint.findOne({ complaintId });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        complaintId: complaint.complaintId,
        category: complaint.category,
        description: complaint.description,
        location: complaint.location,
        imageUrl: complaint.imageUrl,
        status: complaint.status,
        priority: complaint.priority,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message
    });
  }
});

// GET - List all complaints (for admin purposes)
router.get('/', auth, admin, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message
    });
  }
});

// PUT - Update complaint status (for admin purposes)
router.put('/:complaintId', auth, admin, async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, priority } = req.body;
    
    // Handle complaint IDs with or without the CMP- prefix
    let searchId = complaintId;
    if (!complaintId.startsWith('CMP-') && complaintId.length === 8) {
      searchId = `CMP-${complaintId}`;
    } else if (complaintId.startsWith('CMP-') && complaintId.length === 12) {
      // Already in correct format
      searchId = complaintId;
    }
    
    console.log('Searching for complaint with ID:', searchId);
    const complaint = await Complaint.findOne({ complaintId: searchId });
    
    // If not found with the modified ID, try the original ID as fallback
    if (!complaint && searchId !== complaintId) {
      console.log('Not found with modified ID, trying original ID:', complaintId);
      const originalComplaint = await Complaint.findOne({ complaintId });
      if (originalComplaint) {
        console.log('Found complaint with original ID');
        return updateComplaint(originalComplaint, status, priority, res);
      }
    }
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    return updateComplaint(complaint, status, priority, res);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message
    });
  }
});

// Helper function to update and respond with complaint data
const updateComplaint = async (complaint, status, priority, res) => {
  // Update status if provided
  if (status) {
    // Allow admin to update status regardless of image presence
    complaint.status = status;
  }
  
  // Update priority if provided
  if (priority) {
    complaint.priority = priority;
  }
  
  await complaint.save();
  
  return res.status(200).json({
    success: true,
    data: {
      complaintId: complaint.complaintId,
      status: complaint.status,
      priority: complaint.priority
    },
    message: 'Complaint updated successfully'
  });
};

module.exports = router;
