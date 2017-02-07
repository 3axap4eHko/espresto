const { createServer } = require('http');

export default function http({ hostname, port }) {
  return (middleware, callback) => {
    return createServer(middleware).listen(port, hostname, callback);
  }
}