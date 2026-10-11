const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };

http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0].split('#')[0]);
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const filePath = path.resolve(root, relative);
  if (!filePath.startsWith(root)) { response.writeHead(403); return response.end('Forbidden'); }
  fs.readFile(filePath, (error, data) => {
    if (error) { response.writeHead(404); return response.end('Not found'); }
    response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(5500, '127.0.0.1', () => console.log('LunaCycle running at http://127.0.0.1:5500/index.html#register'));
