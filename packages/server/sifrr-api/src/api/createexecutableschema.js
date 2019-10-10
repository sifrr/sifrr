const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { makeExecutableSchema } = require('graphql-tools');
const { fileHeader, timestampHeader, fileSeparator } = require('./constants');
const getLastFile = require('../utils/getlastfile');

function createExecutableSchema(schema, { extra = '', schemaDir } = {}) {
  const typeDefs = [];

  typeDefs.push(schema.getSchema());
  typeDefs.push(extra);

  if (schemaDir) {
    mkdirp(schemaDir);
    const date = new Date();
    const comment = fileHeader + timestampHeader(date) + fileSeparator;
    const oldFile = getLastFile(schemaDir);

    const oldFileContent = fs.existsSync(oldFile)
      ? fs.readFileSync(oldFile, { encoding: 'UTF-8' }).split(fileSeparator)[1]
      : null;
    const newFileContent = typeDefs.join('\n\n') + '\n';

    if (oldFileContent !== newFileContent) {
      fs.writeFileSync(
        path.join(schemaDir, `${date.getTime()}-schema.graphql`),
        comment + newFileContent
      );
    }

    fs.writeFileSync(path.join(schemaDir, '0-schema.graphql'), comment + newFileContent);
  }

  return makeExecutableSchema({
    typeDefs,
    resolvers: schema.getResolvers()
  });
}

module.exports = createExecutableSchema;
