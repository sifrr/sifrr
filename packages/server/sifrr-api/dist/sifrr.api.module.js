/*! Sifrr.Api v0.0.2-alpha - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import graphqlSequelize from 'graphql-sequelize';
import sequelize$1 from 'sequelize';
import graphql$1 from 'graphql';
import fs from 'fs';
import path from 'path';
import graphqlTools from 'graphql-tools';

var flatten = (attrs, separator = ', ') => {
  const str = [];
  for (let attr in attrs) {
    str.push(`${attr}: ${attrs[attr]}`);
  }
  return str.join(separator);
};

var filterobject = function(json, fxn) {
  const res = {};
  for (let k in json) {
    if (fxn(k)) res[k] = json[k];
  }
  return res;
};

var attrstotypes = (attrs, required = [], allowed = []) => {
  if (allowed.length > 0) attrs = filterobject(attrs, (attr) => allowed.indexOf(attr) >= 0 || required.indexOf(attr) >= 0);
  let ret = {};
  for (let attr in attrs) {
    let bang = required.indexOf(attr) >= 0 ? true : false;
    let type;
    if (attrs[attr].returnType) {
      type = attrs[attr].returnType;
    } else if (attrs[attr].type.constructor && attrs[attr].type.constructor.name === 'GraphQLList') {
      type = `[${attrs[attr].type.ofType.name}]`;
    } else if (attrs[attr].type.constructor && attrs[attr].type.constructor.name === 'GraphQLNonNull') {
      type = attrs[attr].type.ofType.name;
      bang = true;
    } else {
      try {
        type = attrs[attr].type.name || attrs[attr].type.ofType.name;
      } catch(e) {
        if (Array.isArray(attrs[attr].type)) type = `[${attrs[attr].type[0]}]`;
        else type = attrs[attr].type || attrs[attr];
      }
    }
    const args = attrs[attr].args ? `(${flatten(attrs[attr].args)})` : '';
    ret[attr + args] = type + (bang ? '!' : '');
  }
  return ret;
};

const { attributeFields, defaultListArgs, defaultArgs } = graphqlSequelize;
const { resolver } = graphqlSequelize;
class SequelizeModel extends sequelize$1.Model {
  static init(options) {
    this.gqAssociations[this.gqName] = {};
    this.gqQuery[this.gqName] = {};
    this.gqMutations[this.gqName] = {};
    this.gqExtraAttrs[this.gqName] = {};
    const ret = super.init(this.schema, options);
    ret.onInit();
    return ret;
  }
  static belongsToMany(model, options) {
    const name = options.as || model.gqName + 's';
    this[name] = super.belongsToMany(model, options);
    this.gqAssociations[this.gqName][name] = { resolver: resolver(this[name]), returnType: `[${model.gqName}]`, model: model };
    return this[name];
  }
  static belongsTo(model, options) {
    const name = options.as || model.gqName;
    this[name] = super.belongsTo(model, options);
    this.gqAssociations[this.gqName][name] = { resolver: resolver(this[name]), returnType: model.gqName, model: model };
    return this[name];
  }
  static hasMany(model, options) {
    const name = options.as || model.gqName + 's';
    this[name] = super.hasMany(model, options);
    this.gqAssociations[this.gqName][name] = { resolver: resolver(this[name]), returnType: `[${model.gqName}]`, model: model };
    return this[name];
  }
  static hasOne(model, options) {
    const name = options.as || model.gqName;
    this[name] = super.hasOne(model, options);
    this.gqAssociations[this.gqName][name] = { resolver: resolver(this[name]), returnType: model.gqName, model: model };
    return this[name];
  }
  static get gqName() {
    return this.name;
  }
  static addAttr(name, options ) {
    this.gqExtraAttrs[this.gqName][name] = options;
  }
  static addQuery(name, options ) {
    this.gqQuery[this.gqName][name] = options;
  }
  static addMutation(name, options ) {
    this.gqMutations[this.gqName][name] = options;
  }
  static gqSchema() {
    return this.gqSchemaAttrs();
  }
  static gqAttrs({ required, allowed } = {}) {
    return attrstotypes(attributeFields(this), required, allowed);
  }
  static gqArgs({ required, allowed } = {}) {
    return attrstotypes(Object.assign(defaultArgs(this), defaultListArgs()), required, allowed);
  }
  static gqSchemaAttrs({ required, allowed } = {}) {
    const args = attributeFields(this);
    const assocs = this.gqAssociations[this.gqName];
    const extras = this.gqExtraAttrs[this.gqName];
    return attrstotypes(Object.assign(args, assocs, extras), required, allowed);
  }
  static get resolvers() {
    const q = { Query: this.gqQuery[this.gqName], Mutation: this.gqMutations[this.gqName] };
    q[this.gqName] = {};
    for (let a in this.gqAssociations[this.gqName]) {
      const assoc = this.gqAssociations[this.gqName][a];
      q[this.gqName][a] = assoc.resolver;
    }
    for (let a in this.gqExtraAttrs[this.gqName]) {
      const attr = this.gqExtraAttrs[this.gqName][a];
      q[this.gqName][a] = attr.resolver;
    }
    return q;
  }
  static getQueryResolver(_, args, ctx, info) {
    let include;
    for (let arg in args.where) {
      if (arg.indexOf('__') >= 0) {
        const assocs = arg.split('__');
        args.where['$' + assocs.join('.') + '$'] = args.where[arg];
        include = this._assocsToInclude(assocs);
        delete args.where[arg];
      }
    }
    return resolver(this, {
      before: (findOptions) => {
        findOptions.include = include;
        return findOptions;
      }
    })(_, args, ctx, info);
  }
  static createMutationResolver(_, args) {
    return this.create(args);
  }
  static updateMutationResolver(_, args) {
    const options = { where: { id: args.id } };
    delete args.id;
    return this.update(args, options).then(() => this.findByPk(options.where.id));
  }
  static upsertMutationResolver(_, args) {
    return this.upsert(args).then(() => this.findByPk(args.id));
  }
  static deleteMutationResolver(_, args) {
    return this.destroy({ where: args });
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
SequelizeModel.gqAssociations = {};
SequelizeModel.gqMutations = {};
SequelizeModel.gqQuery = {};
SequelizeModel.gqExtraAttrs = {};
var sequelize = SequelizeModel;

const { graphql } = graphql$1;
class GraphqlExecutor {
  constructor(executableSchema) {
    this._schema = executableSchema;
    this._middlewares = [];
  }
  resolve(query, variables, context = {}) {
    return graphql({
      schema: this._schema,
      source: query,
      variables,
      contextValue: context
    });
  }
}
var graphqlexecutor = GraphqlExecutor;

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function loadRoutes(app, dir, { ignore = [], basePath = '' }) {
  const paths = [];
  fs
    .readdirSync(dir)
    .filter(file =>
      path.extname(file) === '.js' &&
      ignore.indexOf(file) < 0
    )
    .forEach((file) => {
      const routes = commonjsRequire(path.join(dir, file));
      let basePaths = routes.basePath || '';
      delete routes.basePath;
      if (typeof basePaths === 'string') basePaths = [basePaths];
      basePaths.forEach((basep) => {
        for (const method in routes) {
          const methodRoutes = routes[method];
          for (let r in methodRoutes) {
            app[method](basePath + basep + r, methodRoutes[r]);
            paths.push(basePath + basep + r);
          }
        }
      });
    });
  return paths;
}
var loadroutes = loadRoutes;

var _0777 = parseInt('0777', 8);
var mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    var cb = f || function () {};
    p = path.resolve(p);
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;
            default:
                xfs.stat(p, function (er2, stat) {
                    if (er2 || !stat.isDirectory()) cb(er, made);
                    else cb(null, made);
                });
                break;
        }
    });
}
mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    p = path.resolve(p);
    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }
    return made;
};

const { makeExecutableSchema } = graphqlTools;
function getTypeDef(qs, resolvers) {
  for (let q in qs) {
    const qdet = qs[q];
    resolvers[q] = qdet.resolver;
  }
  return flatten(attrstotypes(qs), '\n  ');
}
function createSchemaFromModels(models, { extra = '', query = {}, mutation = {}, saveSchema = true, schemaPath = './db/schema.graphql' } = {}) {
  const typeDefs = [], resolvers = {};
  for(let modelName in models) {
    typeDefs.push(`type ${models[modelName].gqName} {
  ${flatten(models[modelName].gqSchema(), '\n  ')}
}`);
    Object.assign(resolvers, models[modelName].resolvers);
    Object.assign(query, models[modelName].resolvers.Query);
    Object.assign(mutation, models[modelName].resolvers.Mutation);
  }
  Object.assign(resolvers.Query, query);
  Object.assign(resolvers.Mutation, mutation);
  const qnew = {}, mnew = {};
  const typeDef = `type Query {
  ${getTypeDef(resolvers.Query, qnew)}
}

type Mutation {
  ${getTypeDef(resolvers.Mutation, mnew)}
}

scalar SequelizeJSON
scalar Date
${extra}`;
  typeDefs.unshift(typeDef);
  resolvers.Query = qnew;
  resolvers.Mutation = mnew;
  if (saveSchema) {
    schemaPath = path.resolve(schemaPath);
    mkdirp(path.dirname(schemaPath));
    const comment = '# THIS FILE WAS AUTOGENERATED BY SIFRR-API. DO NOT EDIT THIS FILE DIRECTLY. \n\n';
    fs.writeFileSync(schemaPath, comment + typeDefs.join('\n\n') + '\n');
  }
  return makeExecutableSchema({
    typeDefs,
    resolvers
  });
}
var createschemafrommodels = createSchemaFromModels;

function reqToVariables(req, { allowed = [] } = {}) {
  let args = {};
  Object.assign(args, req.query, req.body, req.params);
  if (allowed.length > 0) args = filterobject(args, (arg) => allowed.indexOf(arg) >= 0);
  for (let arg in args) {
    try {
      args[arg] = JSON.parse(args[arg]);
    } catch(e) {
    }
  }
  return args;
}
var reqtovariables = reqToVariables;

const SifrrApi = {};
SifrrApi.SequelizeModel = sequelize;
SifrrApi.GraphqlExecutor = graphqlexecutor;
SifrrApi.loadRoutes = loadroutes;
SifrrApi.createSchemaFromModels = createschemafrommodels;
SifrrApi.reqToVariables = reqtovariables;
var sifrr_api = SifrrApi;

export default sifrr_api;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.api.module.js.map
