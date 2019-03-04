const Sequelize = require('sequelize');
const sequelize = new Sequelize(require('./config/database')[ENV]);

module.exports = { sequelize, Sequelize };
