const { Client } = require('ssh2');
const fs = require('fs');
require('dotenv').config();

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('cd appgargom && npm install && npx prisma db push && npm run build && pm2 restart ecosystem.config.js', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: process.env.SSH_HOST,
  port: 22,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD
});
