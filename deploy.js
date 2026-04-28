const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Conectado a Plesk por SSH para Gargom.');
  
  // Comando para descargar código, instalar dependencias y reiniciar en Plesk
  const cmd = `
    cd /var/www/vhosts/construccionesgargom.es/app.construccionesgargom.es && 
    rm -f index.html &&
    git init &&
    git remote remove origin 2>/dev/null || true &&
    git remote add origin https://github.com/miempresaonline/app_gargom.git &&
    git fetch --all -f &&
    git reset --hard origin/main &&
    NPM_BIN=$(ls /opt/plesk/node/22*/bin/npm | sort -V | tail -n 1) &&
    NODE_DIR=$(dirname $NPM_BIN) &&
    export PATH=$NODE_DIR:$PATH &&
    echo "Usando NPM en: $NPM_BIN" &&
    npm install && 
    npm run build &&
    mkdir -p tmp && touch tmp/restart.txt
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('🚀 Proceso finalizado con código: ' + code);
      console.log('¡La app se ha actualizado correctamente en el servidor!');
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
