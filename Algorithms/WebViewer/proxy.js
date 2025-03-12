// Save this as proxy.js and run with Node.js (e.g., node proxy.js)
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Parse the incoming URL to get query parameters
  const queryObject = url.parse(req.url, true).query;
  const targetUrl = queryObject.url;

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing url parameter. Please specify ?url=http://example.com');
    return;
  }

  // Choose the correct module based on the protocol
  const client = targetUrl.startsWith('https') ? https : http;

  client.get(targetUrl, (proxyRes) => {
    let data = '';

    // Collect data as it comes in
    proxyRes.on('data', (chunk) => {
      data += chunk;
    });

    proxyRes.on('end', () => {
      // Set CORS header so that browsers allow access to this response
      res.setHeader('Access-Control-Allow-Origin', '*');
      // Pass along the original content type if available
      const contentType = proxyRes.headers['content-type'] || 'text/html';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }).on('error', (err) => {
    console.error('Error fetching the target URL:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error fetching the URL.');
  });
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
