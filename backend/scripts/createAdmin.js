const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ username: 'admin' });
      
      if (existingAdmin) {
        console.log('Admin user already exists');
        process.exit(0);
      }
      
      // Create admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      
      await adminUser.save();
      
      console.log('Admin user created successfully');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('Please change this password in production!');
      
    } catch (error) {
      console.error('Error creating admin user:', error);
    } finally {
      // Disconnect from MongoDB
      mongoose.disconnect();
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
