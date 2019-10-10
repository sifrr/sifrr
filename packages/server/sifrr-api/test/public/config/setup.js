const path = require('path');
const { createExecutableSchema, GraphqlExecutor } = require('../../../src/sifrr.api');
global.ENV = process.env.NODE_ENV || process.env.ENV || 'development';
// Env
module.exports = (saveSchema = true) => {
  const models = require('../models');
  const gqModels = {};
  for (let m in models) {
    gqModels[m] = models[m].graphqlModel;
  }

  // Available globally (also in routes)
  global.graphqlSchema = createExecutableSchema(require('../sequelize').Sequelize.gqSchema, {
    extra: 'scalar Random', // Add scalar Random as we have returnType Random for 'count'
    schemaDir: saveSchema ? path.join(__dirname, '../db') : null
  });
  global.etg = new GraphqlExecutor(global.graphqlSchema);

  Object.assign(global, models);
};
