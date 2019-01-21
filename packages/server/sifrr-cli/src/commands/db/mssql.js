const sql = require('mssql');

const queries = require('./queries');

module.exports = (config, cmd, fxn) => {
  const conn = `mssql://${config.username}:${config.password}@${config.host}`;

  sql.connect(conn).then(() => {
    sql.query(queries[cmd](config.database)).then(fxn).catch(fxn);
  });
};
