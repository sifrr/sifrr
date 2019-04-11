# sifrr-api · [![npm version](https://img.shields.io/npm/v/@sifrr/api.svg)](https://www.npmjs.com/package/@sifrr/api)

Opinionated way of creating normal apis or GraphQL apis using these amazing libraries:

-   [graphql](https://github.com/graphql/graphql-js)
-   [sequelize](https://github.com/sequelize/sequelize)
-   [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize)
-   [graphql-tools](https://github.com/apollographql/graphql-tools)

## Why use sifrr-api

-   This library is mainly to make development of graphQL APIs easier, avoiding manually creating schema/resolvers.
-   Serving graphQL query results easily in route based APIs.
-   Serve both type of APIs at once without duplicating most of the code.

Fully working example [here](https://github.com/sifrr/sifrr-api-demo).

## How to use

Do `npm i @sifrr/api` or `yarn add @sifrr/api` or add the package to your `package.json` file.
You should know basics of graphql and sequelize to use this.

### Model

-   Sifrr Api Model extends Sequelize.model but has more added features

```js
const { Model } = require('@sifrr/api')

// A sequelize model using sifrr/api model will look like
const Sequelize = require('sequelize');
const sequelize = new Sequelize();
const { Model } = require('@sifrr/api');

class User extends Model {
  static init() {
    // Model.init is same as Sequelize.Model.init(schema, options) except it doesn't
    // take schema argument and takes it directly from this.schema
    // So Model.init(options) is basically Sequelize.Model.init(this.schema, options) under the hood
    // with some other additions
    return super.init({ tableName: 'Users', sequelize });
  }

  // This is your sequelize schema
  static get schema() {
    return {
      name: Sequelize.STRING
    };
  }

  // Any Association will be automatically assigned to this[options.as]
  // In this example it will mean
  // User.pets = this.hasMany(models.Pet, { as: 'pets', foreignKey: 'ownerId' });
  // You need to do this same as you normally do for sequelize
  // Object.keys(models).forEach(modelName => {
    // if ('associate' in models[modelName]) {
      // models[modelName].associate(models);
    // }
  });
  static associate(models) {
    this.hasMany(models.Pet, {
      as: 'pets',
      foreignKey: 'ownerId'
    });
  }

  // This will be called in init, to add resolvers to graphql schema generated
  static addResolvers() {
    // Resolvers - need to bind resolvers with this class if they are class function, else it won't work
    const me = this;
    // Add description
    this.graphqlModel.description = 'A pet';

    // don't add createdAt, updatedAt to schema, and allow extra field 'type'
    this.graphqlModel.filterAttributes({
      required: ['name', 'ownerId'],
      allowed: ['id', 'name', 'ownerId', 'owner', 'type']
    });

    // Add resolvers for extra fields (type)
    this.addAttr('type', {
      resolver: (_, args) => {
        return args.type + _.name;
      },
      args: { type: { type: 'String' } },
      returnType: 'String',
      description: 'Random attribute'
    });

    // It's better to add a query/mutation resolver which does something before and then calls predefined resolvers. like customResolver
    // Need to bind static functions resolvers with this class, else it won't work
    // Query Resolvers
    this.addQuery('getPet', {
      args: this.gqArgs(),
      resolver: this.customResolver.bind(me),
      returnType: `[${me.graphqlModel.type}]`,
      description: 'Get one Pet.'
    });

    // Mutation Resolvers
    // 4 predefined resolvers are already there, you can change them or add new, etc.
    this.addMutation(`create${this.graphqlModel.type}`, {
      args: this.gqAttrs({
        required: ['name', 'ownerId'],
        allowed: ['name', 'ownerId']
      }),
      resolver: this.createMutationResolver.bind(this),
      returnType: this.graphqlModel.type
    });
    this.addMutation(`update${this.graphqlModel.type}`, {
      args: this.gqAttrs({ allowed: ['id'], required: ['id'] }),
      resolver: this.updateMutationResolver.bind(this),
      returnType: this.graphqlModel.type
    });
    this.addMutation(`upsert${this.graphqlModel.type}`, {
      args: this.gqAttrs({ allowed: ['id'], required: ['id'] }),
      resolver: this.upsertMutationResolver.bind(this),
      returnType: this.graphqlModel.type
    });
    this.addMutation(`delete${this.graphqlModel.type}`, {
      args: this.gqAttrs({ allowed: ['id'], required: ['id'] }),
      resolver: this.deleteMutationResolver.bind(this),
      returnType: 'Int'
    });

    // Add extra attributes to pet connection
    this.graphqlConnection.addAttribute('total', {
      resolver: (_) => {
        return _.source.countPets();
      },
      returnType: 'Int',
      description: 'Total pets'
    });

    // Add extra arguments to pet connection
    this.graphqlConnection.addArgument('orderBy', '[[String]] = [["name", "ASC"]]');
  }

  // example custom resolver
  static customResolver(_, args, ctx, info) {
    // ctx added in middleware in loadglobals.js can be accessed
    // Throw error and graphql will automatically convert it to json
    if (ctx.random !== 1) throw Error('Random context should be equal to 1');
    // resolve using predefined resolvers
    return this.getQueryResolver(_, args, ctx, info);
  }
}

// Return init model
module.exports = User.init();
```

#### API

[WIP]

### Working Example using all of them together is [here](./test/public)
