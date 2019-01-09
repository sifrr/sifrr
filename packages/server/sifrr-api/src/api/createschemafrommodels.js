const { makeExecutableSchema } = require('graphql-tools');

function getTypeDef(qs, resolvers) {
  let ret = '';
  for (let q in qs) {
    const qdet = qs[q];
    const args = qdet.args ? `(${qdet.args})` : '';
    ret += `${q}${args}: ${qdet.returnType}
    `;
    resolvers[q] = qdet.resolver;
  }
  return ret;
}

function createSchemaFromModels(models, { extra = '', query = {}, mutation = {} } = {}) {
  const typeDefs = [], resolvers = {};
  for(let modelName in models) {
    typeDefs.push(models[modelName].gqSchema);
    Object.assign(resolvers, models[modelName].resolvers);
    Object.assign(query, models[modelName].resolvers.Query);
    Object.assign(mutation, models[modelName].resolvers.Mutation);
  }
  Object.assign(resolvers.Query, query);
  Object.assign(resolvers.Mutation, mutation);

  const qnew = {}, mnew = {};

  const typeDef = `type Query {
    ${getTypeDef(resolvers.Query, qnew)}
  }

  type Mutation {
    ${getTypeDef(resolvers.Mutation, mnew)}
  }

  scalar SequelizeJSON
  scalar Date
  ${extra}
  `;

  typeDefs.push(typeDef);
  resolvers.Query = qnew;
  resolvers.Mutation = mnew;

  return makeExecutableSchema({
    typeDefs,
    resolvers,
  });
}

module.exports = createSchemaFromModels;
