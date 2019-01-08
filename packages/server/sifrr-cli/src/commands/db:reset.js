module.exports = () => {
  const configFile = require(path.resolve('./.sequelizerc')).config;
  const config = require(path.resolve(configFile))[ENV];

  global.console.log(`Using ${config.dialect} in ${ENV} environment`);

  switch(config.dialect) {
  case 'mysql':
    const mysql = require('mysql2');
    const con = mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password,
      port: config.port || 3306,
      multipleStatements: true
    });

    con.connect(function(err) {
      if (err) throw err;
      global.console.log('Connected! \n');
      con.query(`DROP DATABASE IF EXISTS ${config.database}; CREATE DATABASE ${config.database};`, (err) => {
        con.close();
        if (err) throw err;
        global.console.log(`Database ${config.database} dropped and recreated.`);
        exec(`${seqCMD} db:migrate`);
      });
    });
    break;

  case 'postgres':
    const conn = `postgres://${config.username}:${config.password}@${config.host}/postgres`;
    const pg = require('pg');
    pg.connect(conn, (err, client, done) => {
      client.query(`DROP DATABASE IF EXISTS ${config.database}; CREATE DATABASE ${config.database}`, (err) => {
        if (err) throw err;
        global.console.log(`Database ${config.database} dropped and recreated.`);
        exec(`${seqCMD} db:migrate`);
      });
    });
    break;

  case 'mssql':
    const sql = require('mssql');
    sql.connect(`mssql://${config.username}:${config.password}@${config.host}`).then(_ => {
      sql.query(`DROP DATABASE IF EXISTS ${config.database}; CREATE DATABASE ${config.database}`).then(() => {
        global.console.log(`Database ${config.database} dropped and recreated.`);
        exec(`${seqCMD} db:migrate`);
      }).catch((err) => {
        throw err;
      });
    });
    break;

  case 'sqlite':
    const sqlite = require('sqlite3');
    if (config.storage) exec(`rm ${config.storage}`);
    const db = new sqlite3.Database(config.storage || ':memory:',
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if (err) throw err;
        global.console.log(`Database ${config.storage} dropped and recreated.`);
        exec(`${seqCMD} db:migrate`);
      });
    break;
  }
};
