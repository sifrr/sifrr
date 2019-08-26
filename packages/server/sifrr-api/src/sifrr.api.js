const SifrrApi = {};
SifrrApi.SequelizeModel = require('./api/ormmodels/sequelize');
SifrrApi.GraphqlExecutor = require('./api/graphqlexecutor');
SifrrApi.createSchemaFromModels = require('./api/createschemafrommodels');
SifrrApi.reqToVariables = require('./api/reqtovariables');

module.exports = SifrrApi;
