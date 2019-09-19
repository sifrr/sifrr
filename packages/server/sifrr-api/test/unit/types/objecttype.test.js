const ObjectType = require('../../../src/api/types/objects/objecttype');
const InterfaceType = require('../../../src/api/types/objects/interfacetype');
const FieldType = require('../../../src/api/types/fieldtype');
const ArgumentType = require('../../../src/api/types/argumenttype');

describe('Object type', () => {
  const field = new FieldType('field', 'Int!');
  const field2 = new FieldType('field1', 'String', {
    args: [new ArgumentType('arg', 'String')]
  });

  it('works with fields', () => {
    expect(
      new ObjectType('User', {
        fields: [field, field, field2, null, undefined, {}, 'string']
      }).getSchema()
    ).to.equal(`type User {
  field: Int!
  field1(
    arg: String
  ): String
}`);
  });

  it('throws when no fields are present', () => {
    expect(() => new ObjectType('BBB').getSchema()).to.throw();
  });

  it('gives old object if duplicate', () => {
    const pet = new ObjectType('Pet');
    const pet2 = new ObjectType('Pet');
    expect(pet).to.equal(pet2);
  });

  it('works with impl and adds interface fields', () => {
    expect(
      new ObjectType('Umma', {
        fields: [field],
        impl: new InterfaceType('Baaa', { fields: [field2] })
      }).getSchema()
    ).to.equal(`type Umma implements Baaa {
  field: Int!
  field1(
    arg: String
  ): String
}`);
  });
});
