# sifrr-api &middot; [![npm version](https://img.shields.io/npm/v/@sifrr/api.svg)](https://www.npmjs.com/package/@sifrr/api)

Opinionated way of creating normal apis or GraphQL apis using these amazing libraries:

- [graphql](https://github.com/graphql/graphql-js)
- [sequelize](https://github.com/sequelize/sequelize)
- [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize)
- [graphql-tools](https://github.com/apollographql/graphql-tools)

## Why use sifrr-api
- This library is mainly to make development of graphQL APIs easier, avoiding manually creating schema/resolvers.
- Serving graphQL query results easily in route based APIs.
- Serve both type of APIs at once without duplicating most of the code.

Fully working example [here](https://github.com/sifrr/sifrr-api-demo).

## How to use
Do `npm i @sifrr/fetch` or `yarn add @sifrr/fetch` or add the package to your `package.json` file.
You should know basics of graphql and sequelize to use this.

### Model
- Sifrr Api Model extends Sequelize.model but has more added features
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

  // Should return string
  // This will be used when defining type in graphql
  static get gqName() {
    return 'user'; // Default value = this.name;
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
  static associate(models) {
    this.hasMany(models.Pet, {
      as: 'pets',
      foreignKey: 'ownerId'
    });
  }

  // This will be called in init, to add resolvers to graphql schema generated
  static addResolvers() {
    // Resolvers - need to bind resolvers with this class if they are class function, else it won't work

    // getQuery Resolver
    this.addQuery(this.gqName, { args: this.argsToString(this.gqArgs), resolver: this.getQueryResolver.bind(this), returnType: `[${this.gqName}]` });

    // attributes except createdAt and updatedAt
    const attrs = this.gqAttrs;
    delete attrs.createdAt;
    delete attrs.updatedAt;

    this.addMutation(`create${this.gqName}`, { args: this.argsToString(attrs, { allowed: ['name'] }), resolver: this.createMutationResolver.bind(this), returnType: this.gqName });
  }
}

// Return init model
module.exports = User.init();

```
#### API
- `Model.schema` should return sequelize schema
- All associations (`hasOne`, `hasMany`, `belongsTo`, `belongsToMany`) are modified to automatically assign this[options.as] = association
- `Model.gqSchema` should return graphql type definition for this model, like
```schema
type User {
  id: Int!
  name: String
  pets: [${pet model gqName}]
  ....
}
```
it's default value is `Model.sequelizeToGqSchema()`

- `Model.sequelizeToGqSchema({ required: [], allowed: [], extra: [] })` generates graphql type definition automatically based on Model's sequelize schema, gqName, associations. It will add `!` at the end if attribute is non-null type in schema or given in required argument. If provided allowed, only allowed attributes/associations will be added to schema. extra is extra attributes that need to be added to model's graphql schema, eg. [ 'id: Int', 'name: String' ]
- `Model.onInit()` This function is called on init. So add any query/mutation resolvers here, there are a few built-in resolvers available, but query and mutations should be added explicitly.
- `Model.addResolver(name, { resolver })` Add resolvers for extra fields you added in gqSchema.
- `Model.addQuery(name, { args, resolver, returnType })` Adds graphql query of name = name. args are query arguments, resolver is a graphql resolver that is used for resolving the query, and returnType is string which tells which type of data this query will return. eg.
```js
this.addQuery('getUser', {
  args: 'id: Int!, name: String', // string
  resolver: (_, args, ctx, info) => { return data },
  returnType: 'User' // string
});

// This will add this to graphql schema in createSchemaFromModels function and add the resolver
// Query {
//   getUser(id: Int!, name: String): User
// }
```
- `Model.addMutation(name, { args, resolver, returnType })` takes same arguments as addQuery, but adds a graphql mutation instead of query. eg.
```js
this.addQuery('createUser', {
  args: 'name: String', // string
  resolver: (_, args, ctx, info) => { return data },
  returnType: 'User' // string
});

// This will add this to graphql schema in createSchemaFromModels function and add the resolver
// Mutation {
//   createUser(name: String): User
// }
```
- Predefined resolvers:
  - `Model.getQueryResolver`
    Gets data from table, this is essentially `resolver(this)` from [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize), with with one upgrade. You can pass `association__column` in where argument to query based on that association. Returns `[Model.gqName]` type result. eg.
      `User.getQueryResolver(null, { where: { 'pets__id': 1 } })` will return User whose pets id is 1. You can even branch the associations like `'pets__owner__id': 1`, this will return User whose pets' owner's id is 1.
  - `Model.createMutationResolver`
    Creates new row in db table. Takes all column names as arguments. Returns `Model.gqName` type result. eg. `User.createMutationResolver(null, { name: 'Aaditya' })` will create a user with name = Aaditya and returns it.
  - `Model.updateMutationResolver` Takes all column names as arguments, requires `id` of row to update. Returns `Model.gqName`.
  - `Model.upsertMutationResolver` Takes all column names as arguments, requires `id` of row to update/insert. Returns `Model.gqName`.
  - `Model.deleteMutationResolver` Takes only id as arguments, requires `id` of row to delete. Returns `1` of row was deleted and `0` if not.
- `Model.gqArgs` - key-value object of argument name to graphqlObjects. Has `defaultArgs(this)` and `defaultListArgs()` from [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize)
- `Model.gqAttrs` - key-value object of argument name to graphqlObjects. Has `attributeFields(this)` from [graphql-sequelize](https://github.com/mickhansen/graphql-sequelize)
- `Model.argsToString(gqArgs, { required: [], allowed: [] })` takes key-value object of argument name to graphqlObjects as gqArgs and return string to be used by options.args of addQuery/addMutation. Add `!` at end of a argument if it is in required. If allowed is given, only args in allowed are returned.

### createSchemaFromModels
- Takes array of sifrr.api models and returns executable graphql schema. Adds `Model.gqSchema`, Model's queries, mutations, resolvers of model, it's associations, queries and mutations.
```js
const { createSchemaFromModels } = require('@sifrr/api');
const graphqlSchema = createSchemaFromModels([require('./models/user'), ...], {
  {
    query: {}, // name: { args, resolver, returnType } - extra queries to be added in schema
    mutation: {}, // name: { args, resolver, returnType } - extra mutations to be added in schema
    extra: '' // graphql schema string, extra graphql schema to be added
  }
});

// Use it to create an api server using express and express-graphql:
const app = require('express')();
const expressGraphql = require('express-graphql');
server.use('/graphql', expressGraphql({
  schema: graphqlSchema,
  graphiql: true
}));
```

### loadRoutes
Takes (expressApp, RoutesFolderPath, filter) and adds all routes in files in RoutesFolderPath to expressApp except files in filter.
```js
// Example route file:
// ./routes/user.js

module.exports = {
  // basePath is optional, by default it is '', it can be a basePath like '/v1' or an array of basePaths like ['/v1', '/v2']
  // Each basePath should start from '/' and should not end with '/'
  basePath: ['/v1', '/v2'],
  post: {
    // key, value, where value will used by express app for returning response for this route
    '/user': (req, res) => {
      res.json(...);
    }
  },
  get: {
    '/users': (req, res) => {
      res.json(...);
    },
    '/user/:id': (req, res) => {
      res.json(...);
    }
  }
};
```

```js
// ./server.js
const path = require('path');
const app = require('express')();

const { loadRoutes } = require('@sifrr/api');

// if there is a index.js file in routes folder, this will ignore it
// basePath has same syntax as route file basePath, this will be added to all routes in all files
loadRoutes(app, path.join(__dirname, './routes'),{ ignore: [ 'index.js' ], basePath: 'v3' });
```

This will add these routes to express app:
```
// v1, v2 from user routes file
// v3 from loadRoutes

POST /v1/user
POST /v2/user
POST /v3/user

GET /v1/users
GET /v2/users
GET /v3/users

GET /v1/user/:id
GET /v2/user/:id
GET /v3/user/:id
```

### reqToGraphqlArgs
Takes express request object and returns args to be used in graphql query. Only returns arguments given in allowed if allowed is not empty. You should always provide allowed for safety.
```js
const { reqToGraphqlArgs } = require('@sifrr/api');

reqToGraphqlArgs(req, { allowed: ['where', 'name', 'id'] }) // will return args from req.params, req.body, req.query
// will return (where: { id: 1 }, name: "Aadi", id: 1)
// if req.body = '{"where":{"id":1}}', req.paras = { id: "1" }, req.query = { name: "Aadi", whatever: "no returned" }
// If there are duplicate arguments, req.params > req.body > req.query is priority order
```

### ExpressToGraphql
connects graphql executable schema to express routes. eg.
```js
const { ExpressToGraphql } = require('@sifrr/api');

const expressToGq = new ExpressToGraphql(graphqQlExecutableSchema);

// Adding middlewares
expressToGq.use((req, ctx) => {
  // add middleware that modifies req, res and graphql context but don't mutate them
  ctx.user = req.user // example authentication
});

// use it in express routes
// don't wrap reqToGraphqlArgs in brackets, it adds brackets by itself if required
const app = express();
app.use('/user/:id', (req, res) => {
  expressToGq.resolve(req, `
    query {
      user${reqToGraphqlArgs(req, { allowed: ['id'] })} {
        id
        name
        pets {
          id
          name
        }
      }
    }
    `).then(data => res.json());
});

// Going to `/user/1` will return result from executing this graphql query in the graphqQlExecutableSchema given to ExpressToGraphql instance.
{
  query {
    user(id: 1) { // Note that it only has id field, because we allowed on id
      id
      name
      pets {
        id
        name
      }
    }
  }
}
```

### Working Example using all of them together is [here](https://github.com/sifrr/sifrr-api-demo).


