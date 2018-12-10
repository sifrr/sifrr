const connect = require('connect'),
  serveStatic = require('serve-static');

const server = connect().use(serveStatic(__dirname));

module.exports = {
  listen: function(port) {
    return server.listen(port, () => console.log(`Listening on port ${port}`));
  }
}
