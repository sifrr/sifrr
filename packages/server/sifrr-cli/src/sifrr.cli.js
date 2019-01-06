const SifrrApi = {};
SifrrApi.Model = require('./api/model');
SifrrApi.ExpressToGraphql = require('./api/expresstographql');
SifrrApi.loadRoutes = require('./api/loadroutes');
SifrrApi.createSchemaFromModels = require('./api/createschemafrommodels');
SifrrApi.reqToGraphqlArgs = require('./api/reqtographqlargs');

module.exports = SifrrApi;
