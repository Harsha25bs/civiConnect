const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    console.log('Request headers:', req.headers);
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    console.log('Token received:', token.substring(0, 20) + '...');
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Find user by ID
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('User not found for ID:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User not found.'
        });
      }
      
      console.log('User found:', user.username, user._id);
      
      // Add user to request object
      req.user = {
        ...user.toObject(),
        id: user._id.toString() // Ensure ID is consistently available as a string
      };
      console.log('User added to request:', req.user.username, req.user.id);
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

module.exports = { auth, admin };
