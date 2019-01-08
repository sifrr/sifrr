/*! Sifrr.Api v0.0.1-alpha2 - sifrr project */
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
    this.gqQuery[this.gqName] = {};
    this.gqMutations[this.gqName] = {};
    this.gqResolvers[this.gqName] = {};
    const ret = super.init(this.schema, options);
    ret.onInit();
    return ret;
  }

  static belongsToMany(model, options) {
    const name = options.as || model.gqName + 's';
    this[name] = super.belongsToMany(model, options);
    this.gqAssociations[this.gqName][name] = {
      resolver: resolver(this[name]),
      type: `[${model.gqName}]`,
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
      type: `[${model.gqName}]`,
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

  static addResolver(name, options
  /* = { resolver } */
  ) {
    if (typeof options === 'function') this.gqResolvers[this.gqName][name] = {
      resolver: options
    };else this.gqResolvers[this.gqName][name] = options;
  }

  static addMutation(name, options
  /* = { args, resolver, returnType } */
  ) {
    // args = 'id:Int, name:String'
    this.gqMutations[this.gqName][name] = options;
  }

  static addQuery(name, options
  /* = { args, resolver, returnType } */
  ) {
    // args = 'id:Int, name:String'
    this.gqQuery[this.gqName][name] = options;
  }

  static get gqName() {
    return this.name;
  }

  static get gqSchema() {
    return this.sequelizeToGqSchema();
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
    };
    q[this.gqName] = {}; // Associations

    for (let a in this.gqAssociations[this.gqName]) {
      const assoc = this.gqAssociations[this.gqName][a];
      q[this.gqName][a] = assoc.resolver;
    } // Extra


    for (let a in this.gqResolvers[this.gqName]) {
      const assoc = this.gqResolvers[this.gqName][a];
      q[this.gqName][a] = assoc.resolver;
    }

    return q;
  }

  static onInit() {} // Default mutation Resolvers


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
    if (allowed.length > 0) args = filter(args, arg => allowed.indexOf(arg) >= 0 || required.indexOf(arg) >= 0);
    let str = '';

    for (let arg in args) {
      const bang = required.indexOf(arg) >= 0 ? '!' : '';

      if (args[arg].type.constructor.name === 'GraphQLList') {
        str += `${arg}:[${args[arg].type.ofType.name}]${bang}`;
      } else if (args[arg].type.constructor.name === 'GraphQLNonNull') {
        str += `${arg}:${args[arg].type.ofType.name}!`;
      } else {
        try {
          str += `${arg}:${args[arg].type.name || args[arg].type.ofType.name}${bang}`;
        } catch (e) {
          if (Array.isArray(args[arg].type)) str += `${arg}:[${args[arg].type[0]}]${bang}`;else str += `${arg}:${args[arg].type}${bang}`;
        }
      }

      str += separator;
    }

    return str;
  }

  static sequelizeToGqSchema({
    required = [],
    allowed = [],
    extra = []
  } = {}) {
    // Fields - arguments and associations
    const args = attributeFields(this);
    const assocs = this.gqAssociations[this.gqName];
    const me = this;

    if (allowed.length > 0) {
      Object.keys(filter(assocs, assoc => allowed.indexOf(assoc) < 0)).forEach(a => {
        // Remove resolvers for not allowed associations
        delete me.gqAssociations[me.gqName][a];
      });
    }

    let sq = `type ${this.gqName} {
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
      ${extra ? extra.join('\n') + '\n' : ''}}
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
Model.gqResolvers = {};
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
    const routes = commonjsRequire(path.join(dir, file));
    let basePath = routes.basePath || '';
    delete routes.basePath;
    if (typeof basePath === 'string') basePath = [basePath];
    basePath.forEach(basep => {
      for (let method in routes) {
        const methodRoutes = routes[method];

        for (let r in methodRoutes) {
          app[method](basep + r, methodRoutes[r]);
        }
      }
    });
  });
  return app;
}

var loadroutes = loadRoutes;

const {
  makeExecutableSchema
} = graphqlTools;

function createSchemaFromModels(models, extra) {
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
  let queryMutation = 'type Query {';

  for (let query in resolvers.Query) {
    queryMutation += `
    ${query}(${resolvers.Query[query].args}): ${resolvers.Query[query].returnType}`;
    qnew[query] = resolvers.Query[query].resolver;
  }

  queryMutation += `
  }
  `;
  const mnew = {};
  queryMutation += 'type Mutation {';

  for (let mutation in resolvers.Mutation) {
    queryMutation += `
    ${mutation}(${resolvers.Mutation[mutation].args}): ${resolvers.Mutation[mutation].returnType}`;
    mnew[mutation] = resolvers.Mutation[mutation].resolver;
  }

  queryMutation += `
  }

  scalar SequelizeJSON
  scalar Date

  ${extra}
  `;
  typeDefs.push(queryMutation);
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
  Object.assign(args, req.query, req.body, req.params);
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
