const exec = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const schemaPath = path.join(__dirname, '../public/db/schema.graphql');
const { fileSeparator } = require('../../src/api/constants');

describe('createSchemaFromModels', () => {
  it('creates correct schema', () => {
    exec(`rm ${schemaPath}`);

    expect(fs.existsSync(schemaPath)).to.equal(false);

    require('../public/config/setup')();

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
    const oldSchema = fs.readFileSync(schemaPath, { encoding: 'UTF-8' });

    require('../public/config/setup')();

    const newSchema = fs.readFileSync(schemaPath, { encoding: 'UTF-8' });

    expect(oldSchema).to.equal(newSchema);
  });

  it('rewrites if schema has changed', () => {
    fs.writeFileSync(
      schemaPath,
      fileSeparator +
        `type New {
  dummy: ok
}`
    );
    const oldSchema = fs.readFileSync(schemaPath, { encoding: 'UTF-8' });

    require('../public/config/setup')();

    const newSchema = fs.readFileSync(schemaPath, { encoding: 'UTF-8' });

    expect(oldSchema).to.not.equal(newSchema);
  });

  it('should not rewrite schema if no schemaPath', () => {
    fs.writeFileSync(
      schemaPath,
      fileSeparator +
        `type New {
  dummy: ok
}`
    );
    const oldSchema = fs.readFileSync(schemaPath, { encoding: 'UTF-8' });

    require('../public/config/setup')(false);

    const newSchema = fs.readFileSync(schemaPath, { encoding: 'UTF-8' });

    expect(oldSchema).to.equal(newSchema);
  });
});
