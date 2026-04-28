const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `tail -n 40 /var/www/vhosts/construccionesgargom.es/logs/error_log`;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => console.log(d.toString())).stderr.on('data', d => console.log(d.toString())).on('close', () => conn.end());
  });
}).connect({host: '38.242.199.252', port: 22, username: 'construccionesgargom_uznwurhbl1n', password: 'N6OxTjc2t$l&qdg7'});
