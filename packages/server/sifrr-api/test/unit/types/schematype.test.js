const SchemaType = require('../../../src/api/types/schematype');

describe('Schema Type', () => {
  it('create SchemaType from objects', () => {
    const schema = SchemaType.from([
      {
        type: 'union',
        name: 'Any',
        objects: [{ name: 'User' }, { name: 'Pet' }]
      },
      {
        type: 'interface',
        name: 'LivingBeing',
        fields: [{ name: 'Name', type: 'String', nullable: false }]
      },
      {
        type: 'Model',
        name: 'User',
        impl: { name: 'LivingBeing' },
        fields: [{ name: 'what', type: 'Person' }, { name: 'whatNot', type: 'Animal' }]
      },
      {
        type: 'enum',
        name: 'Enum',
        fields: [{ name: 'PERSON' }, { name: 'ANIMAL' }]
      },
      {
        type: 'query',
        fields: [
          { name: 'what', args: [{ name: 'id', type: 'Int', nullable: false }], type: 'Person' }
        ]
      },
      {
        type: 'input',
        name: 'UserInput',
        fields: [{ name: 'what', type: 'Person' }, { name: 'whatNot', type: 'Animal' }]
      }
    ]);

    expect(schema.getSchema()).to.equal(
      `interface LivingBeing {
  Name: String!
}

type User implements LivingBeing {
  what: Person
  whatNot: Animal
}

enum Enum {
  PERSON
  ANIMAL
}

type Query {
  what(id: Int!): Person
}

input UserInput {
  what: Person
  whatNot: Animal
}

union Any = User | Pet`
    );
  });
});
