const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Hardcode the MongoDB URI and JWT_SECRET for this admin fix script
const MONGODB_URI = 'mongodb://localhost:27017/civicconnect';
const JWT_SECRET = 'civiCConnect_secret_key_2025';

console.log('Using MongoDB URI:', MONGODB_URI);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function checkAndFixAdmin() {
  try {
    // Check if admin user exists
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (adminUser) {
      console.log('Admin user exists with ID:', adminUser._id);
      
      // Test if password matches 'admin123'
      const isPasswordCorrect = await bcrypt.compare('admin123', adminUser.password);
      
      if (isPasswordCorrect) {
        console.log('Admin password is correct. No changes needed.');
      } else {
        console.log('Admin password is incorrect. Removing admin user...');
        
        // Remove the admin user with incorrect password
        await User.deleteOne({ _id: adminUser._id });
        console.log('Admin user removed successfully.');
        
        // Create new admin user with correct password
        await createAdminUser();
      }
    } else {
      console.log('Admin user does not exist. Creating new admin user...');
      await createAdminUser();
    }
    
    // Final verification
    const verifyAdmin = await User.findOne({ username: 'admin' });
    if (verifyAdmin) {
      try {
        // Use the model's comparePassword method which is designed to work with the stored hash
        const finalCheck = await verifyAdmin.comparePassword('admin123');
        if (finalCheck) {
          console.log('VERIFICATION SUCCESSFUL: Admin user is properly set up.');
          console.log('You can now log in with:');
          console.log('Username: admin');
          console.log('Password: admin123');
        } else {
          console.log('WARNING: Password verification failed. Please try logging in anyway as the user was created.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        console.log('Admin user was created but verification had an error. Try logging in anyway.');
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    // Delete any existing admin users first to ensure clean state
    await User.deleteMany({ role: 'admin' });
    console.log('Cleared any existing admin users');
    
    // Create a completely new admin user with plain password
    // The User model's pre-save hook will handle the hashing
    const newAdmin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    
    await newAdmin.save();
    console.log('New admin user created successfully with username: admin and password: admin123');
    
    // Verify the user was created
    const createdAdmin = await User.findOne({ username: 'admin' });
    if (createdAdmin) {
      console.log('Admin user verified in database with ID:', createdAdmin._id);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
}

// Run the function
checkAndFixAdmin();