import http from 'node:http';

console.log('🚀 Running API smoke test...');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 8080,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data}`);
    if (res.statusCode === 200) {
      console.log('✅ API Health check passed.');
      process.exit(0);
    } else {
      console.error('❌ Health check returned non-200 code.');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Could not connect to API server: ${e.message}`);
  process.exit(1);
});

req.setTimeout(5000, () => {
  req.destroy(new Error('Request timed out'));
});

req.end();
