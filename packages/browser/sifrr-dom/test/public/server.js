const connect = require('connect'),
  serveStatic = require('serve-static'),
  path = require('path');

const server = connect();
server.use(serveStatic(__dirname));
server.use(serveStatic(path.join(__dirname, '../../dist')));

module.exports = {
  listen: function(port) {
    return server.listen(port, () => console.log(`Listening on port ${port}`));
  }
}
