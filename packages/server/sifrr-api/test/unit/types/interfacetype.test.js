const InterfaceType = require('../../../src/api/graphql/types/objects/interfacetype');
const FieldType = require('../../../src/api/graphql/types/field');

describe('Interface type', () => {
  const field = new FieldType('Int!');

  it('has interface prefix', () => {
    expect(
      new InterfaceType('Interf', {
        fields: { field: field }
      }).getSchema()
    ).to.equal(`interface Interf {
  field: Int!
}`);
  });
});
