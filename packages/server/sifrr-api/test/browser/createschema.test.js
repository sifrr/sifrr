const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const schemaDir = path.join(__dirname, '../public/db');
const { fileSeparator } = require('../../src/api/constants');
const getlastfile = require('../../src/utils/getlastfile');

describe('createExecutableSchema', () => {
  before(() => {
    exec(`rm -rf ${schemaDir}`);
  });

  after(() => {
    exec(`rm -rf ${schemaDir}`);
  });

  it('creates correct schema', () => {
    require('../public/config/setup')();
    const schemaPath = getlastfile(schemaDir);
    expect(fs.existsSync(schemaPath)).to.equal(true);

    const generatedSchema = fs
      .readFileSync(schemaPath, { encoding: 'UTF-8' })
      .split(fileSeparator)[1];
    const correctSchema = fs.readFileSync(path.join(__dirname, './correct.graphql'), {
      encoding: 'UTF-8'
    });

    expect(generatedSchema).to.equal(correctSchema);
  });

  it("doesn't rewrite if schema hasn't changed", () => {
    const schemaPath = getlastfile(schemaDir);

    require('../public/config/setup')();

    const newSchema = getlastfile(schemaDir);

    expect(schemaPath).to.equal(newSchema);
  });

  it('rewrites if schema has changed', async () => {
    const schemaPath = getlastfile(schemaDir);
    fs.writeFileSync(
      schemaPath,
      fileSeparator +
        `type New {
  dummy: ok
}`
    );

    require('../public/config/setup')();
    const newSchema = getlastfile(schemaDir);

    expect(schemaPath).to.not.equal(newSchema);
  });

  it('should not rewrite schema if no schemaPath', () => {
    const schemaPath = getlastfile(schemaDir);
    fs.writeFileSync(
      schemaPath,
      fileSeparator +
        `type New {
  dummy: ok
}`
    );
    require('../public/config/setup')(false);

    const newSchema = getlastfile(schemaDir);

    expect(schemaPath).to.equal(newSchema);
  });
});
