const connect = require('connect'),
  serveStatic = require('serve-static'),
  path = require('path');

const server = connect();
server.use(serveStatic(__dirname));
server.use(serveStatic(path.join(__dirname, '../../dist')));

server.listen(process.argv[2], () => console.log(`Listening on port ${process.argv[2]}`));
