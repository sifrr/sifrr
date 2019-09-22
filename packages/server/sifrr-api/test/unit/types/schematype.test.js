const ObjectType = require('../../../src/api/types/objects/objecttype');
const ModelType = require('../../../src/api/types/objects/modeltype');
const FieldType = require('../../../src/api/types/fieldtype');
const SchemaType = require('../../../src/api/types/schematype');

describe('Schema Type', () => {
  before(() => {
    ObjectType.all = [];
  });

  it('create SchemaType from objects', () => {
    const schema = SchemaType.from([
      {
        type: 'union',
        name: 'Any',
        types: [{ name: 'User' }, { name: 'Pet' }]
      },
      {
        type: 'interface',
        name: 'LivingBeing',
        fields: [{ name: 'Name', type: 'String', nullable: false }]
      },
      {
        type: 'Model',
        name: 'User',
        interfaces: [{ name: 'LivingBeing' }, { name: 'Admin' }],
        fields: [{ name: 'what', type: 'Person' }, { name: 'whatNot', type: 'Animal' }]
      },
      {
        type: 'enum',
        name: 'Enum',
        fields: [{ name: 'PERSON' }, { name: 'ANIMAL' }],
        description: 'A type of enum'
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
      },
      new ModelType('Banger', {
        fields: FieldType.from([
          {
            name: 'Name',
            type: 'Int'
          }
        ])
      })
    ]);

    expect(schema.getSchema()).to.equal(
      `interface LivingBeing {
  Name: String!
}

type User implements LivingBeing & Admin {
  what: Person
  whatNot: Animal
}

"""
A type of enum
"""
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

type Banger {
  Name: Int
}

union Any = User | Pet`
    );
  });
});
