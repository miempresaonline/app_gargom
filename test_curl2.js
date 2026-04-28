const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `echo "--- LOCAL 3005 ---" && curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3005/ && echo "\n--- DOMAIN ---" && curl -s -o /dev/null -w "%{http_code}" https://app.construccionesgargom.es/`;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => console.log(d.toString())).stderr.on('data', d => console.log(d.toString())).on('close', () => conn.end());
  });
}).connect({host: '38.242.199.252', port: 22, username: 'construccionesgargom_uznwurhbl1n', password: 'N6OxTjc2t$l&qdg7'});
