const ObjectType = require('../../../src/api/graphql/types/objects/objecttype');
const ModelType = require('../../../src/api/graphql/types/objects/modeltype');
const FieldType = require('../../../src/api/graphql/types/field');
const SchemaType = require('../../../src/api/graphql/types/schematype');

describe('Schema Type', () => {
  before(() => {
    ObjectType.all = [];
  });

  it('create SchemaType from objects', () => {
    const schema = SchemaType.from([
      {
        type: 'union',
        name: 'Any',
        types: [
          { name: 'User' },
          {
            type: 'model',
            name: 'Pet',
            fields: { what: { type: 'Animal' }, whatNot: { type: 'Person' } }
          }
        ]
      },
      {
        type: 'interface',
        name: 'LivingBeing',
        fields: { name: { type: 'String', nullable: false } }
      },
      {
        type: 'Model',
        name: 'User',
        interfaces: [
          { name: 'LivingBeing' },
          {
            name: 'Admin',
            fields: { Role: { type: 'String', default: 'Admin', nullable: false } }
          }
        ],
        fields: { what: { type: 'Person' }, whatNot: { type: 'Animal' } }
      },
      {
        type: 'connection',
        name: 'UserConnection',
        edgeType: {
          name: 'SomeBody',
          type: 'Model',
          fields: { what: { type: 'Person' }, whatNot: { type: 'Animal' } }
        },
        fields: { total: { type: 'Int', nullable: false } }
      },
      {
        type: 'enum',
        name: 'Enum',
        fields: [{ name: 'PERSON' }, { name: 'ANIMAL' }],
        description: 'A type of enum'
      },
      {
        type: 'object',
        name: 'query',
        fields: { what: { args: { id: { type: 'Int', nullable: false } }, type: 'Person' } }
      },
      {
        type: 'input',
        name: 'UserInput',
        fields: { what: { type: 'Person' }, whatNot: { type: 'Animal' } }
      },
      new ModelType('Banger', {
        fields: FieldType.from({
          Name: {
            type: 'Int'
          }
        })
      })
    ]);

    expect(schema.getSchema()).to.equal(
      `interface LivingBeing {
  Name: String!
}

interface Admin {
  Role: String!
}

type User implements LivingBeing & Admin {
  what: Person
  whatNot: Animal
  Name: String!
  Role: String!
}

type SomeBody {
  what: Person
  whatNot: Animal
}

type UserConnection {
  total: Int!
  edges: [SomeBody]
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

type Pet {
  what: Animal
  whatNot: Person
}

union Any = User | Pet`
    );
  });
});
