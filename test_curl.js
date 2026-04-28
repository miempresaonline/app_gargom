const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `curl -i http://127.0.0.1:3005/`;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => console.log('STDOUT: ' + d.toString())).stderr.on('data', d => console.log('STDERR: ' + d.toString())).on('close', () => conn.end());
  });
}).connect({host: '38.242.199.252', port: 22, username: 'construccionesgargom_uznwurhbl1n', password: 'N6OxTjc2t$l&qdg7'});
