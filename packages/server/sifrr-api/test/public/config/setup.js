// Env
module.exports = (saveSchema = true) => {
  global.ENV = process.env.NODE_ENV || process.env.ENV || 'development';

  const { createSchemaFromModels, GraphqlExecutor } = require('../../../src/sifrr.api');
  const path = require('path');

  const models = require('../models');
  const gqModels = {};
  for (let m in models) {
    gqModels[m] = models[m].graphqlModel;
  }

  // Available globally (also in routes)
  global.graphqlSchema = createSchemaFromModels(gqModels, {
    query: {
      count: { // Add extra query 'count' just for example
        args: '',
        resolver: (_, __, ctx) => {
          return ctx.count || 0;
        },
        returnType: 'Random'
      }
    },
    extra: 'scalar Random', // Add scalar Random as we have returnType Random for 'count'
    schemaPath: saveSchema ? path.join(__dirname, '../db/schema.graphql') : ''
  });
  global.etg = new GraphqlExecutor(graphqlSchema);

  Object.assign(global, models);
};
