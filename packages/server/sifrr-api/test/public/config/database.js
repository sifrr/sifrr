const Op = require('sequelize').Op;

module.exports = {
  development: {
    username: 'root',
    password: null,
    database: 'sifrr_api_development',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: Op,
    benchmark: true
  },
  test: {
    username: 'root',
    password: null,
    database: 'sifrr_api_test',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: Op
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql',
    operatorsAliases: Op
    // dialectOptions: {
    //   ssl: {
    //     ca: fs.readFileSync(__dirname + '/mysql-ca-master.crt')
    //   }
    // }
  }
};
