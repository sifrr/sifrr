const SifrrApi = {};
SifrrApi.SequelizeModel = require('./api/models/sequelize');
SifrrApi.ExpressToGraphql = require('./api/expresstographql');
SifrrApi.loadRoutes = require('./api/loadroutes');
SifrrApi.createSchemaFromModels = require('./api/createschemafrommodels');
SifrrApi.reqToGraphqlArgs = require('./api/reqtographqlargs');

module.exports = SifrrApi;
