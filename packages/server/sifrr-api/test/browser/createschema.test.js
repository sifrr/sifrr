const exec = require('child_process').execSync;
const fs = require('fs');

describe('createSchemaFromModels', () => {
  it('creates correct schema', () => {
    const schemaPath = path.join(__dirname, '../public/db/schema.graphql');
    const { fileSeparator } = require('../../src/api/constants');
    exec(`rm ${schemaPath}`);

    expect(fs.existsSync(schemaPath)).to.equal(false);

    require('../public/config/setup')();

    expect(fs.existsSync(schemaPath)).to.equal(true);

    const generatedSchema = fs.readFileSync(schemaPath, { encoding: 'UTF-8' }).split(fileSeparator)[1];
    const correctSchema = fs.readFileSync(path.join(__dirname, './correct.graphql'), { encoding: 'UTF-8' });

    expect(generatedSchema).to.equal(correctSchema);
  });
});
