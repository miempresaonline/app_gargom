const path = require('path');
const { execSync } = require('child_process');

try {
  // Copy static assets into the standalone directory for production
  execSync('cp -r public .next/standalone/public 2>/dev/null');
  execSync('mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static 2>/dev/null');
} catch (e) {}

// Tell Passenger to run the standalone Next.js server
const standaloneDir = path.join(__dirname, '.next', 'standalone');
process.chdir(standaloneDir);

// Load the Next.js standalone server. Passenger intercepts http.listen
require(path.join(standaloneDir, 'server.js'));
