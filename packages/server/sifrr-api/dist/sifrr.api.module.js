/*! Sifrr.Api v0.0.1-alpha - sifrr project */
import graphqlSequelize from 'graphql-sequelize';
import sequelize from 'sequelize';
import graphql from 'graphql';
import fs from 'fs';
import path from 'path';
import graphqlTools from 'graphql-tools';

const {
  attributeFields,
  defaultListArgs,
  defaultArgs
} = graphqlSequelize;
const {
  resolver
} = graphqlSequelize;

class Model extends sequelize.Model {
  static init(options) {
    this.gqAssociations[this.gqName] = {};
    const ret = super.init(this.schema, options);
    ret.addResolvers();
    return ret;
  }

  static get gqName() {
    return this.name;
  }

  static belongsToMany(model, options) {
    const name = options.as || model.gqName + 's';
    this[name] = super.belongsToMany(model, options);
    this.gqAssociations[this.gqName][name] = {
      resolver: resolver(this[name]),
      type: [model.gqName],
      model: model
    };
    return this[name];
  }

  static belongsTo(model, options) {
    const name = options.as || model.gqName;
    this[name] = super.belongsTo(model, options);
    this.gqAssociations[this.gqName][name] = {
      resolver: resolver(this[name]),
      type: model.gqName,
      model: model
    };
    return this[name];
  }

  static hasMany(model, options) {
    const name = options.as || model.gqName + 's';
    this[name] = super.hasMany(model, options);
    this.gqAssociations[this.gqName][name] = {
      resolver: resolver(this[name]),
      type: [model.gqName],
      model: model
    };
    return this[name];
  }

  static hasOne(model, options) {
    const name = options.as || model.gqName;
    this[name] = super.hasOne(model, options);
    this.gqAssociations[this.gqName][name] = {
      resolver: resolver(this[name]),
      type: model.gqName,
      model: model
    };
    return this[name];
  }

  static addMutation(name, options
  /* = { args, resolver, returnType } */
  ) {
    // args = 'id:Int, name:String'
    this.gqMutations[this.gqName] = this.gqMutations[this.gqName] || {};
    this.gqMutations[this.gqName][name] = options;
  }

  static removeMutation(name) {
    delete this.gqMutations[this.gqName][name];
  }

  static addQuery(name, options
  /* = { args, resolver, returnType } */
  ) {
    // args = 'id:Int, name:String'
    this.gqQuery[this.gqName] = this.gqQuery[this.gqName] || {};
    this.gqQuery[this.gqName][name] = options;
  }

  static removeQuery(name) {
    delete this.gqQuery[this.gqName][name];
  }

  static get gqSchema() {
    return this.sequelizeToGqSchema(this);
  }

  static extraGqSchemaFields() {
    return '';
  }

  static get gqAttrs() {
    return attributeFields(this);
  }

  static get gqArgs() {
    return Object.assign(defaultArgs(this), defaultListArgs());
  }

  static get resolvers() {
    const q = {
      Query: this.gqQuery[this.gqName],
      Mutation: this.gqMutations[this.gqName]
    }; // Associations

    q[this.gqName] = {};

    for (let a in this.gqAssociations[this.gqName]) {
      const assoc = this.gqAssociations[this.gqName][a];
      q[this.gqName][a] = assoc.resolver;
    }

    return q;
  }

  static addResolvers() {} // Default mutation Resolvers


  static getQueryResolver(_, args, ctx, info) {
    let include;

    for (let arg in args.where) {
      if (arg.indexOf('__') >= 0) {
        const assocs = arg.split('__');
        args.where[`$${assocs.join('.')}$`] = args.where[arg];
        include = this._assocsToInclude(assocs);
        delete args.where[arg];
      }
    }

    return resolver(this, {
      before: findOptions => {
        findOptions.include = include;
        return findOptions;
      }
    })(_, args, ctx, info);
  }

  static createMutationResolver(_, args) {
    return this.create(args);
  }

  static updateMutationResolver(_, args) {
    const options = {
      where: {
        id: args.id
      }
    };
    delete args.id;
    return this.update(args, options).then(() => this.findByPk(options.where.id));
  }

  static upsertMutationResolver(_, args) {
    return this.upsert(args).then(() => this.findByPk(args.id));
  }

  static deleteMutationResolver(_, args) {
    return this.destroy({
      where: args
    });
  } // Takes arguments from graphql-sequelize or arg: {type: 'type' or ['type']} and coverts them to string 'id:Int, arg:type',
  // if arg is in required, it will add ! at the end, if arg is in ignore it won't add it


  static argsToString(args, {
    required = [],
    allowed = [],
    separator = ', '
  } = {}) {
    if (allowed.length > 0) args = filter(args, arg => allowed.indexOf(arg) >= 0);
    let str = '';

    for (let arg in args) {
      if (args[arg].constructor.name === 'GraphQLList') {
        str += `${arg}:[${args[arg].type.ofType.name}]${required.indexOf(arg) >= 0 ? '!' : ''}`;
      } else if (args[arg].constructor.name === 'GraphQLNonNull') {
        str += `${arg}:${args[arg].type.ofType.name}!`;
      } else {
        try {
          str += `${arg}:${args[arg].type.name || args[arg].type.ofType.name}${required.indexOf(arg) >= 0 ? '!' : ''}`;
        } catch (e) {
          if (Array.isArray(args[arg].type)) str += `${arg}:[${args[arg].type}]${required.indexOf(arg) >= 0 ? '!' : ''}`;else str += `${arg}:${args[arg].type}${required.indexOf(arg) >= 0 ? '!' : ''}`;
        }
      }

      str += separator;
    }

    return str;
  }

  static sequelizeToGqSchema(model, {
    required = [],
    allowed = []
  } = {}) {
    // Fields
    const args = attributeFields(model);
    const assocs = model.gqAssociations[model.gqName];
    let sq = `type ${model.gqName} {
      ${this.argsToString(args, {
      required,
      allowed,
      separator: '\n'
    })}
      ${this.argsToString(assocs, {
      required,
      allowed,
      separator: '\n'
    })}
    `;
    if (this.extraGqSchemaFields()) sq += this.extraGqSchemaFields() + '\n';
    sq += `}
    `;
    return sq;
  }

  static _assocsToInclude(assocs, column = true, model = this) {
    if (column) assocs.pop();
    const assocName = assocs.shift();
    const include = [{
      model: model.gqAssociations[model.gqName][assocName].model,
      as: assocName
    }];

    if (assocs.length > 0) {
      include[0].include = this._assocsToInclude(assocs, false, model.gqAssociations[model.gqName][assocName].model);
    }

    return include;
  }

}

function filter(json, fxn) {
  const res = {};

  for (let k in json) {
    if (fxn(k)) res[k] = json[k];
  }

  return res;
}

Model.gqAssociations = {};
Model.gqMutations = {};
Model.gqQuery = {};
var model = Model;

const {
  graphql: graphql$1
} = graphql;

class ExpressToGraphql {
  constructor(schema) {
    this._schema = schema;
    this._middlewares = [];
  }

  resolve(req, res, query, context = {}) {
    this._middlewares.forEach(m => {
      m(res, res, context);
    });

    return graphql$1({
      schema: this._schema,
      source: query,
      contextValue: context
    }).then(data => res.json(data));
  }

  use(fxn) {
    this._middlewares.push(fxn);
  }

}

var expresstographql = ExpressToGraphql;

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function loadRoutes(app, dir, filter = []) {
  fs.readdirSync(dir).filter(file => path.extname(file) === '.js' && filter.indexOf(file) < 0).forEach(file => {
    const routes = commonjsRequire(path.join(__dirname, file));

    for (let method in routes) {
      const methodRoutes = routes[method];

      for (let r in methodRoutes) {
        app[method](r, methodRoutes[r]);
      }
    }
  });
  return app;
}

var loadroutes = loadRoutes;

const {
  makeExecutableSchema
} = graphqlTools;

function createSchemaFromModels(models) {
  const typeDefs = [];
  const resolvers = {};
  const query = {},
        mutation = {};

  for (let modelName in models) {
    typeDefs.push(models[modelName].gqSchema);
    Object.assign(resolvers, models[modelName].resolvers);
    Object.assign(query, models[modelName].resolvers.Query);
    Object.assign(mutation, models[modelName].resolvers.Mutation);
  }

  Object.assign(resolvers.Query, query);
  Object.assign(resolvers.Mutation, mutation);
  const qnew = {};
  let queryTypeDef = 'type Query {';

  for (let query in resolvers.Query) {
    queryTypeDef += `
    ${query}(${resolvers.Query[query].args}): ${resolvers.Query[query].returnType}`;
    qnew[query] = resolvers.Query[query].resolver;
  }

  queryTypeDef += `
  }
  `;
  const mnew = {};
  queryTypeDef += 'type Mutation {';

  for (let mutation in resolvers.Mutation) {
    queryTypeDef += `
    ${mutation}(${resolvers.Mutation[mutation].args}): ${resolvers.Mutation[mutation].returnType}`;
    mnew[mutation] = resolvers.Mutation[mutation].resolver;
  }

  queryTypeDef += `
  }

  scalar SequelizeJSON
  scalar Date
  `;
  typeDefs.push(queryTypeDef);
  resolvers.Query = qnew;
  resolvers.Mutation = mnew;
  return makeExecutableSchema({
    typeDefs,
    resolvers
  });
}

var createschemafrommodels = createSchemaFromModels;

function filter$1(json, fxn) {
  const res = {};

  for (let k in json) {
    if (fxn(k)) res[k] = json[k];
  }

  return res;
}

function reqToGraphqlArgs(req, {
  allowed = []
} = {}) {
  let args = {};
  Object.assign(args, req.body, req.params);
  if (allowed.length > 0) args = filter$1(args, arg => allowed.indexOf(arg) >= 0);

  for (let arg in args) {
    try {
      args[arg] = JSON.parse(args[arg]);
    } catch (e) {// Do nothing if it is not json
    }
  }

  const ret = JSON.stringify(args).slice(1, -1).replace(/"([^(")"]+)":/g, '$1:');
  return ret ? `(${ret})` : '';
}

var reqtographqlargs = reqToGraphqlArgs;

const SifrrApi = {};
SifrrApi.Model = model;
SifrrApi.ExpressToGraphql = expresstographql;
SifrrApi.loadRoutes = loadroutes;
SifrrApi.createSchemaFromModels = createschemafrommodels;
SifrrApi.reqToGraphqlArgs = reqtographqlargs;
var sifrr_api = SifrrApi;

export default sifrr_api;
/*! (c) @aadityataparia */
