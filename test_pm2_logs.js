const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `NPM_BIN=$(ls /opt/plesk/node/22*/bin/npm | sort -V | tail -n 1) && NODE_DIR=$(dirname $NPM_BIN) && export PATH=$NODE_DIR:$PATH && npx pm2 logs gargom --lines 30 --nostream`;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => console.log('STDOUT: ' + d.toString())).stderr.on('data', d => console.log('STDERR: ' + d.toString())).on('close', () => conn.end());
  });
}).connect({host: '38.242.199.252', port: 22, username: 'construccionesgargom_uznwurhbl1n', password: 'N6OxTjc2t$l&qdg7'});
