const SifrrApi = {};
SifrrApi.SequelizeModel = require('./api/ormmodels/sequelize');
SifrrApi.GraphqlExecutor = require('./api/graphqlexecutor');
SifrrApi.createExecutableSchema = require('./api/createexecutableschema');
SifrrApi.reqToVariables = require('./api/reqtovariables');

module.exports = SifrrApi;
