const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `cd /var/www/vhosts/construccionesgargom.es/app.construccionesgargom.es && ln -sfn .next _next && echo "✅ Enlace simbólico _next creado en producción!"`;
  conn.exec(cmd, (err, stream) => {
    stream.on('data', d => console.log('STDOUT: ' + d.toString())).stderr.on('data', d => console.log('STDERR: ' + d.toString())).on('close', () => conn.end());
  });
}).connect({host: '38.242.199.252', port: 22, username: 'construccionesgargom_uznwurhbl1n', password: 'N6OxTjc2t$l&qdg7'});
