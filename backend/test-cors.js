const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'CORS test successful!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`CORS test server running on port ${PORT}`);
});
