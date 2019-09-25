const ObjectType = require('../../../src/api/graphql/types/objects/objecttype');
const InterfaceType = require('../../../src/api/graphql/types/objects/interfacetype');
const FieldType = require('../../../src/api/graphql/types/fieldtype');
const ArgumentType = require('../../../src/api/graphql/types/argumenttype');

describe('Object type', () => {
  const field = new FieldType('field', 'Int!');
  const field2 = new FieldType('field1', 'String', {
    args: [new ArgumentType('arg', 'String')]
  });

  before(() => {
    ObjectType.all = [];
  });

  it('works with fields', () => {
    expect(
      new ObjectType('User', {
        fields: [field, field, field2, { name: 'some', type: 'Int' }]
      }).getSchema()
    ).to.equal(`type User {
  field: Int!
  field1(arg: String): String
  some: Int
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
        interfaces: new InterfaceType('Baaa', { fields: [field2] })
      }).getSchema()
    ).to.equal(`type Umma implements Baaa {
  field: Int!
  field1(arg: String): String
}`);
  });

  it('clones object', () => {
    const object = new ObjectType('Umma', {
      fields: [field],
      interfaces: new InterfaceType('Baaa', { fields: [field2] })
    });

    expect(object.clone('Noob').getSchema()).to.equal(`type Noob implements Baaa {
  field: Int!
  field1(arg: String): String
}`);
  });
});
