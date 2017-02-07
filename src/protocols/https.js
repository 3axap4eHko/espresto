const { readFileSync } = require('fs');
const { createServer } = require('https');

export default function https({ hostname, port, privateKey, certificate }) {
  const key = readFileSync(privateKey, 'utf8');
  const cert = readFileSync(certificate, 'utf8');
  return (middleware, callback) => {
    return createServer({ key, cert }, middleware).listen(port, hostname, callback);
  }
}