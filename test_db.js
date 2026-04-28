const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Conectado a Plesk por SSH.');
  conn.exec(`mysql -u construccionesgargom_uznwurhbl1n -p'N6OxTjc2t$l&qdg7' -e "SHOW DATABASES;"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('🚀 Finalizado con código: ' + code);
      conn.end();
    }).on('data', (data) => {
      console.log('📝 STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('⚠️ STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('❌ Error SSH:', err);
}).connect({
  host: '38.242.199.252',
  port: 22,
  username: 'construccionesgargom_uznwurhbl1n',
  password: 'N6OxTjc2t$l&qdg7'
});
