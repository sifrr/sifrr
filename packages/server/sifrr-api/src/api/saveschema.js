const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { printSchema } = require('graphql');
const { fileHeader, timestampHeader, fileSeparator } = require('./constants');
const getLastFile = require('../utils/getlastfile');

function createExecutableSchema(
  schema,
  { schemaDir = path.resolve('./schema'), printOptions } = {}
) {
  const printedSchema = printSchema(schema, printOptions);

  mkdirp(schemaDir);
  const date = new Date();
  const comment = fileHeader + timestampHeader(date) + fileSeparator;
  const oldFile = getLastFile(schemaDir);

  const oldFileContent = fs.existsSync(oldFile)
    ? fs.readFileSync(oldFile, { encoding: 'UTF-8' }).split(fileSeparator)[1]
    : null;
  const newFileContent = printedSchema;

  if (oldFileContent !== newFileContent) {
    fs.writeFileSync(
      path.join(schemaDir, `${date.getTime()}-schema.graphql`),
      comment + newFileContent
    );
  }

  fs.writeFileSync(path.join(schemaDir, '0-schema.graphql'), comment + newFileContent);
}

module.exports = createExecutableSchema;
