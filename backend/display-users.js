const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Define User schema (simplified version of the actual User model)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Function to display users in a formatted table
function displayUsers(users) {
  console.log('\n===== REGISTERED USERS =====');
  console.log('Total Users:', users.length);
  console.log('============================');
  
  // Calculate column widths based on data
  const idWidth = 24;
  const usernameWidth = Math.max(8, ...users.map(u => u.username?.length || 0));
  const emailWidth = Math.max(5, ...users.map(u => u.email?.length || 0));
  const nameWidth = Math.max(4, ...users.map(u => u.name?.length || 0));
  const roleWidth = Math.max(4, ...users.map(u => u.role?.length || 0));
  
  // Print header
  console.log(
    'ID'.padEnd(idWidth) + 
    'USERNAME'.padEnd(usernameWidth + 2) + 
    'EMAIL'.padEnd(emailWidth + 2) + 
    'NAME'.padEnd(nameWidth + 2) + 
    'ROLE'.padEnd(roleWidth + 2) + 
    'CREATED AT'
  );
  
  console.log('-'.repeat(idWidth + usernameWidth + emailWidth + nameWidth + roleWidth + 40));
  
  // Print each user
  users.forEach(user => {
    console.log(
      (user._id.toString() || 'N/A').padEnd(idWidth) + 
      (user.username || 'N/A').padEnd(usernameWidth + 2) + 
      (user.email || 'N/A').padEnd(emailWidth + 2) + 
      (user.name || 'N/A').padEnd(nameWidth + 2) + 
      (user.role || 'N/A').padEnd(roleWidth + 2) + 
      (user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A')
    );
  });
  
  console.log('============================\n');
}

// Connect to MongoDB and fetch users
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI environment variable is not set.');
      console.log('Make sure you have a .env file with MONGODB_URI defined.');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully.');
    
    // Fetch all users
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      displayUsers(users);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the script
main();
