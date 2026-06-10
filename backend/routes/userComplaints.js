const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// GET - Fetch all complaints for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/user-complaints route called');
    
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

module.exports = router;
