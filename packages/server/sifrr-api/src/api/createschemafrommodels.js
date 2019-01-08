const { makeExecutableSchema } = require('graphql-tools');

function createSchemaFromModels(models, extra) {
  const typeDefs = [];
  const resolvers = {};
  const query = {}, mutation = {};
  for(let modelName in models) {
    typeDefs.push(models[modelName].gqSchema);
    Object.assign(resolvers, models[modelName].resolvers);
    Object.assign(query, models[modelName].resolvers.Query);
    Object.assign(mutation, models[modelName].resolvers.Mutation);
  }
  Object.assign(resolvers.Query, query);
  Object.assign(resolvers.Mutation, mutation);

  const qnew = {};

  let queryMutation = 'type Query {';
  for (let query in resolvers.Query) {
    queryMutation += `
    ${query}(${resolvers.Query[query].args}): ${resolvers.Query[query].returnType}`;
    qnew[query] = resolvers.Query[query].resolver;
  }
  queryMutation += `
  }
  `;

  const mnew = {};
  queryMutation += 'type Mutation {';
  for (let mutation in resolvers.Mutation) {
    queryMutation += `
    ${mutation}(${resolvers.Mutation[mutation].args}): ${resolvers.Mutation[mutation].returnType}`;
    mnew[mutation] = resolvers.Mutation[mutation].resolver;
  }
  queryMutation += `
  }

  scalar SequelizeJSON
  scalar Date

  ${extra}
  `;

  typeDefs.push(queryMutation);
  resolvers.Query = qnew;
  resolvers.Mutation = mnew;

  return makeExecutableSchema({
    typeDefs,
    resolvers
  });
}

module.exports = createSchemaFromModels;
