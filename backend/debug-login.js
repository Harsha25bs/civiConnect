const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function debugLogin() {
  try {
    // Find the admin user
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found in the database!');
      return;
    }
    
    console.log('Admin user details:');
    console.log('- ID:', adminUser._id);
    console.log('- Username:', adminUser.username);
    console.log('- Role:', adminUser.role);
    console.log('- Password (hashed):', adminUser.password);
    console.log('- Created at:', adminUser.createdAt);
    
    // Test password comparison
    console.log('\nTesting password comparison:');
    
    // Test with 'admin123'
    const testPassword1 = 'admin123';
    const isMatch1 = await adminUser.comparePassword(testPassword1);
    console.log(`Password '${testPassword1}': ${isMatch1 ? 'MATCH ✓' : 'NO MATCH ✗'}`);
    
    // Try a few other common variations
    const testPassword2 = 'Admin123';
    const isMatch2 = await adminUser.comparePassword(testPassword2);
    console.log(`Password '${testPassword2}': ${isMatch2 ? 'MATCH ✓' : 'NO MATCH ✗'}`);
    
    const testPassword3 = 'admin';
    const isMatch3 = await adminUser.comparePassword(testPassword3);
    console.log(`Password '${testPassword3}': ${isMatch3 ? 'MATCH ✓' : 'NO MATCH ✗'}`);
    
    // If none match, create a new admin user with the correct password
    if (!isMatch1 && !isMatch2 && !isMatch3) {
      console.log('\nNo password matched. Creating a new admin user...');
      
      // Remove the existing admin
      await User.deleteOne({ _id: adminUser._id });
      console.log('Existing admin user removed.');
      
      // Create a new admin user
      const newAdmin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log('New admin user created with username: admin and password: admin123');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the function
debugLogin();
