const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const attrsToTypes = require('./attrtypes');
const flatten = require('./flatten');
const { makeExecutableSchema } = require('graphql-tools');
const { fileHeader, fileSeparator } = require('./constants');

function getTypeDef(qs, resolvers) {
  for (let q in qs) {
    const qdet = qs[q];
    resolvers[q] = qdet.resolver;
  }
  return flatten(attrsToTypes(qs), '\n  ', true);
}

function createSchemaFromModels(models, { extra = '', queries = {}, mutations = {}, saveSchema = true, schemaPath = './db/schema.graphql' } = {}) {
  const connections = {}, typeDefs = [], resolvers = {};
  for(let modelName in models) {
    const model = models[modelName].graphqlModel;
    typeDefs.push(model.getSchema());
    Object.assign(queries, model.queries);
    Object.assign(mutations, model.mutations);
    resolvers[model.type] = resolvers[model.type] || {};
    Object.assign(resolvers[model.type], model.getResolvers());
    model.connections.forEach(conn => {
      connections[conn.type] = conn;
    });
  }

  for (let name in connections) {
    const conn = connections[name];
    typeDefs.push(conn.getSchema());
    resolvers[conn.type] = resolvers[conn.type] || {};
    Object.assign(resolvers[conn.type], conn.getResolvers());
  }

  const qnew = {}, mnew = {};

  const queryMut = `type Query {
  ${getTypeDef(queries, qnew)}
}

type Mutation {
  ${getTypeDef(mutations, mnew)}
}

scalar SequelizeJSON
scalar Date
${extra}`;

  typeDefs.unshift(queryMut);
  resolvers.Query = qnew;
  resolvers.Mutation = mnew;

  if (saveSchema) {
    schemaPath = path.resolve(schemaPath);
    mkdirp(path.dirname(schemaPath));
    const comment = fileHeader + `# Genarated at ${new Date().toUTCString()} (${Date.now()}) \n` + fileSeparator;
    const oldFileContent = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, { encoding: 'UTF-8' }).split(fileSeparator)[1] : '';
    const newFileContent = typeDefs.join('\n\n') + '\n';
    if (oldFileContent !== newFileContent) fs.writeFileSync(schemaPath, comment + newFileContent);
  }

  return makeExecutableSchema({
    typeDefs,
    resolvers
  });
}

module.exports = createSchemaFromModels;
