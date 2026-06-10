const http = require('http');

function setupAdmin() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/setup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Response:', response);
        
        if (response.success) {
          console.log('Admin user created successfully!');
          console.log('Username: admin');
          console.log('Password: admin123');
        } else {
          console.log('Failed to create admin user:', response.message);
        }
      } catch (error) {
        console.error('Error parsing response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error setting up admin user:', error.message);
  });

  req.end();
}

setupAdmin();
