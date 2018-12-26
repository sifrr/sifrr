const connect = require('express'),
  serveStatic = require('serve-static'),
  path = require('path');

const server = connect();
server.use(serveStatic(__dirname));
server.use(serveStatic(path.join(__dirname, '../../dist')));
server.use((req, res) => res.sendFile(path.join(__dirname, './index.html')));

server.listen(process.argv[2], () => console.log(`Listening on port ${process.argv[2]}`));
