const express = require('express'),
  serveStatic = require('serve-static'),
  path = require('path');


let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}

let dir = __dirname;
const diri = Math.max(process.argv.indexOf('--dir'), process.argv.indexOf('-d'));
if (diri !== -1) {
  dir = path.join(__dirname, process.argv[diri + 1]);
}

const server = express();

// export server for importing
const sss = {
  listen: function(port, directory = dir) {
    server.use(serveStatic(directory));
    server.use(serveStatic(path.join(directory, '../../dist')));
    server.use((req, res) => res.sendFile(path.join(directory, './index.html')));
    return server.listen(port, () => console.log(`Listening on port ${port} and directory '${directory}'`));
  }
};

// listen on port if port given
if (port) {
  sss.listen(port);
}

module.exports = sss;
