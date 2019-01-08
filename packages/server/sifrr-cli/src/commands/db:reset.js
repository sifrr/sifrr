module.exports = () => {
  const path = require('path');

  const configFile = require(path.resolve('./.sequelizerc')).config;
  const seqCMD = 'PATH=$(npm bin):$PATH sequelize';

  const config = require(path.resolve(configFile))[ENV];

  switch(config.dialect) {
  case 'mysql':
    const mysql = require('mysql2');
    const con = mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password,
      multipleStatements: true
    });

    con.connect(function(err) {
      if (err) throw err;
      global.console.log('Connected! \n');
      con.query(`DROP DATABASE IF EXISTS ${config.database}; CREATE DATABASE ${config.database};`, function (err) {
        con.close();
        if (err) throw err;
        global.console.log(`Database ${config.database} dropped and recreated.`);
        exec(`${seqCMD} db:migrate`);
      });
    });

    break;

  case 'postgres':
    // implement for this dialect
    global.console.log(config.dialect);
    break;
  case 'mssql':
    // implement for this dialect
    global.console.log(config.dialect);
    break;
  case 'sqlite':
    // implement for this dialect
    global.console.log(config.dialect);
    break;
  }
};
