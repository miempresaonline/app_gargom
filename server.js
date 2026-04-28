process.env.NODE_ENV = 'production';
const path = require('path');
const http = require('http');

// Next.js server requires required-server-files.json
let conf = {};
try {
  conf = require('./.next/required-server-files.json').config;
} catch (e) {
  console.error('Could not load required-server-files.json. Ensure you have run "npm run build".');
}

const NextServer = require('next/dist/server/next-server').default;

const app = new NextServer({
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  dir: __dirname,
  dev: false,
  conf,
});

const handler = app.getRequestHandler();

const server = http.createServer((req, res) => {
  handler(req, res).catch((err) => {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
});
