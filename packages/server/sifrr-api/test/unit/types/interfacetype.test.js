const InterfaceType = require('../../../src/api/types/interfacetype');
const FieldType = require('../../../src/api/types/fieldtype');

describe('Object type', () => {
  const field = new FieldType('field', 'Int!');

  it('has interface prefix', () => {
    expect(
      new InterfaceType('Interf', {
        fields: [field]
      }).getSchema()
    ).to.equal(`interface Interf {
  field: Int!
}`);
  });
});
