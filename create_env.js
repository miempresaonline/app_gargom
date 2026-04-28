const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Conectado a Plesk por SSH.');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const content = `DATABASE_URL="mysql://appgargom:Malabares16*@127.0.0.1:3306/appgargom"
JWT_SECRET_KEY="f3b9c7d4e1a2b5c6d9e0f3b9c7d4e1a2"`;
    
    const targetPath = '/var/www/vhosts/construccionesgargom.es/app.construccionesgargom.es/.env';
    
    const writeStream = sftp.createWriteStream(targetPath);
    writeStream.on('close', () => {
      console.log('✅ .env creado correctamente.');
      conn.end();
    });
    writeStream.write(content);
    writeStream.end();
  });
}).on('error', (err) => {
  console.error('❌ Error de conexión SSH:', err);
}).connect({
  host: '38.242.199.252',
  port: 22,
  username: 'construccionesgargom_uznwurhbl1n',
  password: 'N6OxTjc2t$l&qdg7'
});
