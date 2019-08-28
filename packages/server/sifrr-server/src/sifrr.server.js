const queryString = require('query-string');

module.exports = {
  App: require('./server/app'),
  SSLApp: require('./server/sslapp'),
  mimes: require('./server/mime').mimes,
  getMime: require('./server/mime').getMime,
  writeHeaders: require('./server/utils').writeHeaders,
  sendFile: require('./server/sendfile'),
  Cluster: require('./server/cluster'),
  livereload: require('./server/livereload'),
  livereloadjs: require('./server/livereloadjs'),
  getQuery: req => {
    return queryString.parse(req.getQuery());
  }
};
