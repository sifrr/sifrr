const ObjectType = require('../../../src/api/graphql/types/objects/objecttype');
const ModelType = require('../../../src/api/graphql/types/objects/modeltype');
const InterfaceType = require('../../../src/api/graphql/types/objects/interfacetype');
const FieldType = require('../../../src/api/graphql/types/field');
const ArgumentType = require('../../../src/api/graphql/types/argument');
const { clear } = require('../../../src/api/graphql/types/objects/alltypes');

describe('Object type', () => {
  const field = new FieldType('Int!');
  const field1 = new FieldType('String', {
    args: { arg: new ArgumentType('String') }
  });

  beforeEach(() => {
    clear();
  });

  it('works with fields', () => {
    expect(
      new ObjectType('User', {
        fields: { field, field1, some: new FieldType('Int') }
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
      new ModelType('Umma', {
        fields: [field],
        interfaces: new InterfaceType('Baro', { fields: { field1 } })
      }).getSchema()
    ).to.equal(`type Umma implements Baro {
  field: Int!
  field1(arg: String): String
}`);
  });

  it('clones object only fields', () => {
    const object = new ModelType('Umma', {
      fields: { field },
      interfaces: new InterfaceType('Baaa', { fields: { field1 } })
    });

    expect(object.clone('Noob').getSchema()).to.equal(`type Noob {
  field: Int!
  field1(arg: String): String
}`);
  });

  it('filters fields in cloning', () => {
    const object = new ModelType('OKaa', {
      fields: { field },
      interfaces: new InterfaceType('Baaar', { fields: { field1 } })
    });

    expect(object.clone('Suree', {}, f => f === 'field').getSchema()).to.equal(`type Suree {
  field: Int!
}`);
  });
});
