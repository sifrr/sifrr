const ObjectType = require('../../../src/api/types/objecttype');
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
    expect(() => new ObjectType('Pet').getSchema()).to.throw();
  });

  it('works with impl', () => {
    expect(new ObjectType('Pet', { fields: [field], impl: new ObjectType('Bang') }).getSchema()).to
      .equal(`type Pet implements Bang {
  field: Int!
}`);
  });
});
