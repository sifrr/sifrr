const connect = require('express'),
  serveStatic = require('serve-static'),
  path = require('path');

const server = connect();
server.use(serveStatic(__dirname));
server.use(serveStatic(path.join(__dirname, '../../dist')));

if (process.argv[2]) server.listen(process.argv[2], () => console.log(`Listening on port ${process.argv[2]}`));

module.exports = {
  listen: function(port) {
    return server.listen(port, () => console.log(`Listening on port ${port}`));
  }
};
