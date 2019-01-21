const mysql = require('mysql2');

const queries = require('./queries');

module.exports = (config, cmd, fxn) => {
  const con = mysql.createConnection({
    host: config.host,
    user: config.username,
    password: config.password,
    port: config.port || 3306,
    multipleStatements: true
  });

  con.connect(function(err) {
    if (err) throw err;

    con.query(queries[cmd](config.database), fxn);
  });
};
