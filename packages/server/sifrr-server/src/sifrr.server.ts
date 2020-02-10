import queryString from 'query-string';
import App from './server/app';
import SSLApp from './server/sslapp';
import { mimes, getMime } from './server/mime';
import { writeHeaders } from './server/utils';
import sendFile from './server/sendfile';
import Cluster from './server/cluster';
import livereload from './server/livereload';

const getQuery = req => {
  return queryString.parse(req.getQuery());
};

module.exports = {
  App,
  SSLApp,
  mimes,
  getMime,
  writeHeaders,
  sendFile,
  Cluster,
  livereload,
  getQuery
};
