const fs = require('fs');

function shellQuote(value) {
  return "'" + String(value || '').replace(/'/g, "'\"'\"'") + "'";
}

const configPath = process.argv[2];
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const remotePath = String(config.remotePath || '').replace(/^\/+|\/+$/g, '');

console.log('FTP_HOST=' + shellQuote(config.host));
console.log('FTP_PORT=' + shellQuote(config.port || 21));
console.log('FTP_USER=' + shellQuote(config.username));
console.log('FTP_PASS=' + shellQuote(config.password));
console.log('FTP_BASE_DIR=' + shellQuote(remotePath));
console.log('FTP_SCHEME=' + shellQuote(config.protocol || 'ftp'));
