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
    database: 'sifrr_test',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: Op
  },
  production: {
    username: 'root',
    password: null,
    database: 'sifrr_api_development',
    host: '127.0.0.1',
    dialect: 'mysql',
    operatorsAliases: Op,
    benchmark: true
  }
};
