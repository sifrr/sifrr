const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const attrsToTypes = require('./attrtypes');
const flatten = require('./flatten');
const { makeExecutableSchema } = require('graphql-tools');
const { fileHeader, timestampHeader, fileSeparator } = require('./constants');
const Sequelize = require('sequelize');

function getTypeDef(qs, resolvers) {
  for (let q in qs) {
    const qdet = qs[q];
    resolvers[q] = qdet.resolver;
  }
  return flatten(attrsToTypes(qs), '\n  ', true);
}

function createSchemaFromModels(
  models,
  { extra = '', queries = {}, mutations = {}, schemaPath } = {}
) {
  const typeDefs = [];

  const queryMut = `scalar SequelizeJSON
scalar Date
${extra}`;

  console.log(Sequelize.gqSchema.getSchema());
  typeDefs.push(Sequelize.gqSchema.getSchema());
  typeDefs.push(queryMut);

  if (schemaPath) {
    mkdirp(path.dirname(schemaPath));
    const comment = fileHeader + timestampHeader + fileSeparator;
    const oldFileContent = fs.existsSync(schemaPath)
      ? fs.readFileSync(schemaPath, { encoding: 'UTF-8' }).split(fileSeparator)[1]
      : null;
    const newFileContent = typeDefs.join('\n\n') + '\n';
    if (oldFileContent !== newFileContent) fs.writeFileSync(schemaPath, comment + newFileContent);
  }

  return makeExecutableSchema({
    typeDefs,
    resolvers: Sequelize.gqSchema.getResolvers()
  });
}

module.exports = createSchemaFromModels;
