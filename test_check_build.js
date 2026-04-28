const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Conectado a Plesk por SSH.');
  
  const cmd = `
    cd /var/www/vhosts/construccionesgargom.es/app.construccionesgargom.es &&
    NPM_BIN=$(ls /opt/plesk/node/22*/bin/npm | sort -V | tail -n 1) &&
    NODE_DIR=$(dirname $NPM_BIN) &&
    export PATH=$NODE_DIR:$PATH &&
    npm run build
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('🚀 Proceso finalizado con código: ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('📝 STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('⚠️ STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión SSH:', err);
}).connect({
  host: '38.242.199.252',
  port: 22,
  username: 'construccionesgargom_uznwurhbl1n',
  password: 'N6OxTjc2t$l&qdg7'
});
