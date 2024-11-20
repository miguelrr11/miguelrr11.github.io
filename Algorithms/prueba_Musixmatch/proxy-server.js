// proxy-server.js
const https = require('https');
const http = require('http');
const httpProxy = require('http-proxy');

// Create an https agent that ignores certificate errors
const agent = new https.Agent({
  rejectUnauthorized: false
});

// Create a proxy server that uses the agent
const proxy = httpProxy.createProxyServer({
  target: 'https://api.textyl.co',
  changeOrigin: true,
  agent: agent
});

http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Proxy requests to the target
  proxy.web(req, res);
}).listen(3000, () => {
  console.log('Proxy server listening on http://127.0.0.1:3000');
});
