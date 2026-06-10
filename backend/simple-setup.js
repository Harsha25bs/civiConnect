const response = await API.post('/auth/login', formData);const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});const http = require('http');

console.log('Sending request to create admin user...');

const req = http.request({
  host: 'localhost',
  port: 5000,
  path: '/api/auth/setup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('\nIf successful, you can now log in with:');
    console.log('Username: admin');
    console.log('Password: admin123');
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
console.log('Request sent. Waiting for response...');
