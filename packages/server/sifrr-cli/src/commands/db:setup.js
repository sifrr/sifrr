/* eslint no-case-declarations: 0 */

module.exports = () => {
  const configFile = require(path.resolve('./.sequelizerc')).config;
  const config = require(path.resolve(configFile))[ENV];

  switch(config.dialect) {
  case 'mysql':
    const mysql = require('mysql2');
    const con = mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password,
      port: config.port
    });

    con.connect(function(err) {
      if (err) throw err;
      global.console.log('Connected! \n');
      con.query(`CREATE DATABASE IF NOT EXISTS ${config.database};`, function (err) {
        con.close();
        if (err) throw err;
        global.console.log(`Database ${config.database} setted up.`);
        exec(`${seqCMD} db:migrate`);
      });
    });
    break;

  case 'postgres':
    const conn = `postgres://${config.username}:${config.password}@${config.host}/postgres`;
    const pg = require('pg');
    pg.connect(conn, (err, client) => {
      client.query(`CREATE DATABASE IF NOT EXISTS ${config.database};`, (err) => {
        if (err) throw err;
        global.console.log(`Database ${config.database} setted up.`);
        exec(`${seqCMD} db:migrate`);
      });
    });
    break;

  case 'mssql':
    const sql = require('mssql');
    sql.connect(`mssql://${config.username}:${config.password}@${config.host}`).then(() => {
      sql.query(`CREATE DATABASE IF NOT EXISTS ${config.database};`).then(() => {
        global.console.log(`Database ${config.database} setted up.`);
        exec(`${seqCMD} db:migrate`);
      }).catch((err) => {
        throw err;
      });
    });
    break;

  case 'sqlite':
    const sqlite = require('sqlite3');
    if (config.storage) exec(`rm ${config.storage}`);
    new sqlite.Database(config.storage || ':memory:',
      sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE,
      (err) => {
        if (err) throw err;
        global.console.log(`Database ${config.database} setted up.`);
        exec(`${seqCMD} db:migrate`);
      });
    break;
  }
};
