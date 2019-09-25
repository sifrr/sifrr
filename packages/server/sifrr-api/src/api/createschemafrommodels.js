const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { makeExecutableSchema } = require('graphql-tools');
const { fileHeader, timestampHeader, fileSeparator } = require('./constants');
const Sequelize = require('sequelize');

function createSchemaFromModels(models, { extra = '', schemaPath } = {}) {
  const typeDefs = [];

  extra = `scalar SequelizeJSON
scalar Date
${extra}`;

  typeDefs.push(Sequelize.gqSchema.getSchema());
  typeDefs.push(extra);

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
