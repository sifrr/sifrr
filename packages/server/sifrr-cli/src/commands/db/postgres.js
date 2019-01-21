const pg = require('pg');

const queries = require('./queries');

module.exports = (config, cmd, fxn) => {
  const conn = `postgres://${config.username}:${config.password}@${config.host}/postgres`;
  pg.connect(conn, (err, client) => {
    if (err) throw err;

    client.query(queries[cmd](config.database), fxn);
  });
};
