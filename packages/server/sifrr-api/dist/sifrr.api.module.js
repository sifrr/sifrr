/*! Sifrr.Api v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import graphqlSequelize from 'graphql-sequelize';
import sequelize$1 from 'sequelize';
import graphql$1 from 'graphql';
import fs from 'fs';
import path from 'path';
import graphqlTools from 'graphql-tools';

var flatten = (attrs, separator = ', ', addDescription = false) => {
  const str = [];
  for (let attr in attrs) {
    if (addDescription && attrs[attr].description) str.push(`"""${attrs[attr].description}"""`);
    str.push(`${attr}: ${attrs[attr].type || attrs[attr]}`);
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

var attrtypes = (attrs, required = [], allowed = []) => {
  if (allowed.length > 0) attrs = filterobject(attrs, (attr) => allowed.indexOf(attr) >= 0 || required.indexOf(attr) >= 0);
  let ret = {};
  for (let attr in attrs) {
    let bang = required.indexOf(attr) >= 0 ? true : false;
    let type;
    if (attrs[attr].returnType) {
      type = attrs[attr].returnType;
    } else if (!attrs[attr].type) {
      type = attrs[attr];
    } else if (attrs[attr].type.constructor.name === 'GraphQLList') {
      type = `[${attrs[attr].type.ofType.name}]`;
    } else if (attrs[attr].type.constructor.name === 'GraphQLNonNull') {
      type = attrs[attr].type.ofType.name;
      bang = true;
    } else if (attrs[attr].type.name) {
      type = attrs[attr].type.name;
    } else if (attrs[attr].type.ofType && attrs[attr].type.ofType.name) {
      type = attrs[attr].type.ofType.name;
    } else {
      type = attrs[attr].type;
    }
    const args = attrs[attr].args ? `(${flatten(attrs[attr].args)})` : '';
    ret[attr + args] = { type: type + (bang ? '!' : '') };
    if (attrs[attr].description) ret[attr + args].description = attrs[attr].description;
  }
  return ret;
};

class BaseType {
  constructor(attributes) {
    this._attributes = attributes;
  }
  addAttribute(name, attribute) {
    this._attributes[name] = attribute;
  }
  filterAttributes({ allowed = [], required = [] }) {
    this._allowedAttrs = allowed;
    this._reqAttrs = required;
  }
  getFilteredAttributes({ required = [], allowed = [] }) {
    return attrtypes(this._attributes, required, allowed);
  }
  getResolvers() {
    const resolvers = {};
    for (let attr in this._attributes) {
      if (this._attributes[attr].resolver) resolvers[attr] = this._attributes[attr].resolver;
    }
    return resolvers;
  }
  get attributes() {
    return this.getFilteredAttributes({ required: this._reqAttrs, allowed: this._allowedAttrs });
  }
  get schemaPrefix() {
    return `${this.description ? `""" ${this.description} """ \n` : '' }`;
  }
}
var basetype = BaseType;

class Model extends basetype {
  constructor(type, attributes = {}, { queries = {}, mutations = {} }) {
    super(attributes);
    this.type = type;
    this.queries = queries;
    this.mutations = mutations;
    this.connections = [];
    this._allowedAttrs = [];
    this._reqAttrs = [];
    this.description;
  }
  addConnection(name, connection) {
    this.connections.push(connection);
    this._attributes[name] = connection;
  }
  addQuery(name, query) {
    this.queries[name] = query;
  }
  addMutation(name, mutation) {
    this.mutations[name] = mutation;
  }
  getSchema() {
    return this.schemaPrefix + `type ${this.type} {
  ${flatten(this.attributes, '\n  ', true)}
}`;
  }
}
var model = Model;

class Connection extends basetype {
  constructor(type, args, resolver, nodeType) {
    super({});
    this.type = type;
    this.args = args;
    this.resolver = resolver;
    this.nodeType = nodeType;
    this.description;
  }
  clone(resolver) {
    const conn = new Connection(this.type, this.args, resolver, this.nodeType);
    conn._attributes = this._attributes;
    conn.description = this.description;
    return conn;
  }
  addArgument(name, type) {
    this.args[name] = type;
  }
  getSchema() {
    return this.schemaPrefix + `type ${this.type} {
  edges: [${this.type + 'Edge'}]
  ${flatten(this.attributes, '\n  ', true)}
}

type ${this.type + 'Edge'} {
  node: ${this.nodeType}
  cursor: String
}`;
  }
}
var connection = Connection;

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var connection$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectionArgs = exports.backwardConnectionArgs = exports.forwardConnectionArgs = undefined;
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
exports.connectionDefinitions = connectionDefinitions;
var forwardConnectionArgs = exports.forwardConnectionArgs = {
  after: {
    type: graphql$1.GraphQLString
  },
  first: {
    type: graphql$1.GraphQLInt
  }
};
var backwardConnectionArgs = exports.backwardConnectionArgs = {
  before: {
    type: graphql$1.GraphQLString
  },
  last: {
    type: graphql$1.GraphQLInt
  }
};
var connectionArgs = exports.connectionArgs = _extends({}, forwardConnectionArgs, backwardConnectionArgs);
function resolveMaybeThunk(thingOrThunk) {
  return typeof thingOrThunk === 'function' ?
  thingOrThunk() : thingOrThunk;
}
function connectionDefinitions(config) {
  var nodeType = config.nodeType;
  var name = config.name || nodeType.name;
  var edgeFields = config.edgeFields || {};
  var connectionFields = config.connectionFields || {};
  var resolveNode = config.resolveNode;
  var resolveCursor = config.resolveCursor;
  var edgeType = new graphql$1.GraphQLObjectType({
    name: name + 'Edge',
    description: 'An edge in a connection.',
    fields: function fields() {
      return _extends({
        node: {
          type: nodeType,
          resolve: resolveNode,
          description: 'The item at the end of the edge'
        },
        cursor: {
          type: new graphql$1.GraphQLNonNull(graphql$1.GraphQLString),
          resolve: resolveCursor,
          description: 'A cursor for use in pagination'
        }
      }, resolveMaybeThunk(edgeFields));
    }
  });
  var connectionType = new graphql$1.GraphQLObjectType({
    name: name + 'Connection',
    description: 'A connection to a list of items.',
    fields: function fields() {
      return _extends({
        pageInfo: {
          type: new graphql$1.GraphQLNonNull(pageInfoType),
          description: 'Information to aid in pagination.'
        },
        edges: {
          type: new graphql$1.GraphQLList(edgeType),
          description: 'A list of edges.'
        }
      }, resolveMaybeThunk(connectionFields));
    }
  });
  return { edgeType: edgeType, connectionType: connectionType };
}
var pageInfoType = new graphql$1.GraphQLObjectType({
  name: 'PageInfo',
  description: 'Information about pagination in a connection.',
  fields: function fields() {
    return {
      hasNextPage: {
        type: new graphql$1.GraphQLNonNull(graphql$1.GraphQLBoolean),
        description: 'When paginating forwards, are there more items?'
      },
      hasPreviousPage: {
        type: new graphql$1.GraphQLNonNull(graphql$1.GraphQLBoolean),
        description: 'When paginating backwards, are there more items?'
      },
      startCursor: {
        type: graphql$1.GraphQLString,
        description: 'When paginating backwards, the cursor to continue.'
      },
      endCursor: {
        type: graphql$1.GraphQLString,
        description: 'When paginating forwards, the cursor to continue.'
      }
    };
  }
});
});
unwrapExports(connection$1);
var connection_1 = connection$1.connectionArgs;
var connection_2 = connection$1.backwardConnectionArgs;
var connection_3 = connection$1.forwardConnectionArgs;
var connection_4 = connection$1.connectionDefinitions;

var base64_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.base64 = base64;
exports.unbase64 = unbase64;
function base64(i) {
  return Buffer.from(i, 'utf8').toString('base64');
}
function unbase64(i) {
  return Buffer.from(i, 'base64').toString('utf8');
}
});
unwrapExports(base64_1);
var base64_2 = base64_1.base64;
var base64_3 = base64_1.unbase64;

var arrayconnection = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectionFromArray = connectionFromArray;
exports.connectionFromPromisedArray = connectionFromPromisedArray;
exports.connectionFromArraySlice = connectionFromArraySlice;
exports.connectionFromPromisedArraySlice = connectionFromPromisedArraySlice;
exports.offsetToCursor = offsetToCursor;
exports.cursorToOffset = cursorToOffset;
exports.cursorForObjectInConnection = cursorForObjectInConnection;
exports.getOffsetWithDefault = getOffsetWithDefault;
function connectionFromArray(data, args) {
  return connectionFromArraySlice(data, args, {
    sliceStart: 0,
    arrayLength: data.length
  });
}
function connectionFromPromisedArray(dataPromise, args) {
  return dataPromise.then(function (data) {
    return connectionFromArray(data, args);
  });
}
function connectionFromArraySlice(arraySlice, args, meta) {
  var after = args.after,
      before = args.before,
      first = args.first,
      last = args.last;
  var sliceStart = meta.sliceStart,
      arrayLength = meta.arrayLength;
  var sliceEnd = sliceStart + arraySlice.length;
  var beforeOffset = getOffsetWithDefault(before, arrayLength);
  var afterOffset = getOffsetWithDefault(after, -1);
  var startOffset = Math.max(sliceStart - 1, afterOffset, -1) + 1;
  var endOffset = Math.min(sliceEnd, beforeOffset, arrayLength);
  if (typeof first === 'number') {
    if (first < 0) {
      throw new Error('Argument "first" must be a non-negative integer');
    }
    endOffset = Math.min(endOffset, startOffset + first);
  }
  if (typeof last === 'number') {
    if (last < 0) {
      throw new Error('Argument "last" must be a non-negative integer');
    }
    startOffset = Math.max(startOffset, endOffset - last);
  }
  var slice = arraySlice.slice(Math.max(startOffset - sliceStart, 0), arraySlice.length - (sliceEnd - endOffset));
  var edges = slice.map(function (value, index) {
    return {
      cursor: offsetToCursor(startOffset + index),
      node: value
    };
  });
  var firstEdge = edges[0];
  var lastEdge = edges[edges.length - 1];
  var lowerBound = after ? afterOffset + 1 : 0;
  var upperBound = before ? beforeOffset : arrayLength;
  return {
    edges: edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage: typeof last === 'number' ? startOffset > lowerBound : false,
      hasNextPage: typeof first === 'number' ? endOffset < upperBound : false
    }
  };
}
function connectionFromPromisedArraySlice(dataPromise, args, arrayInfo) {
  return dataPromise.then(function (data) {
    return connectionFromArraySlice(data, args, arrayInfo);
  });
}
var PREFIX = 'arrayconnection:';
function offsetToCursor(offset) {
  return (0, base64_1.base64)(PREFIX + offset);
}
function cursorToOffset(cursor) {
  return parseInt((0, base64_1.unbase64)(cursor).substring(PREFIX.length), 10);
}
function cursorForObjectInConnection(data, object) {
  var offset = data.indexOf(object);
  if (offset === -1) {
    return null;
  }
  return offsetToCursor(offset);
}
function getOffsetWithDefault(cursor, defaultOffset) {
  if (typeof cursor !== 'string') {
    return defaultOffset;
  }
  var offset = cursorToOffset(cursor);
  return isNaN(offset) ? defaultOffset : offset;
}
});
unwrapExports(arrayconnection);
var arrayconnection_1 = arrayconnection.connectionFromArray;
var arrayconnection_2 = arrayconnection.connectionFromPromisedArray;
var arrayconnection_3 = arrayconnection.connectionFromArraySlice;
var arrayconnection_4 = arrayconnection.connectionFromPromisedArraySlice;
var arrayconnection_5 = arrayconnection.offsetToCursor;
var arrayconnection_6 = arrayconnection.cursorToOffset;
var arrayconnection_7 = arrayconnection.cursorForObjectInConnection;
var arrayconnection_8 = arrayconnection.getOffsetWithDefault;

var mutation = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
exports.mutationWithClientMutationId = mutationWithClientMutationId;
function resolveMaybeThunk(thingOrThunk) {
  return typeof thingOrThunk === 'function' ?
  thingOrThunk() : thingOrThunk;
}
function mutationWithClientMutationId(config) {
  var name = config.name,
      description = config.description,
      deprecationReason = config.deprecationReason,
      inputFields = config.inputFields,
      outputFields = config.outputFields,
      mutateAndGetPayload = config.mutateAndGetPayload;
  var augmentedInputFields = function augmentedInputFields() {
    return _extends({}, resolveMaybeThunk(inputFields), {
      clientMutationId: {
        type: graphql$1.GraphQLString
      }
    });
  };
  var augmentedOutputFields = function augmentedOutputFields() {
    return _extends({}, resolveMaybeThunk(outputFields), {
      clientMutationId: {
        type: graphql$1.GraphQLString
      }
    });
  };
  var outputType = new graphql$1.GraphQLObjectType({
    name: name + 'Payload',
    fields: augmentedOutputFields
  });
  var inputType = new graphql$1.GraphQLInputObjectType({
    name: name + 'Input',
    fields: augmentedInputFields
  });
  return {
    type: outputType,
    description: description,
    deprecationReason: deprecationReason,
    args: {
      input: { type: new graphql$1.GraphQLNonNull(inputType) }
    },
    resolve: function resolve(_, _ref, context, info) {
      var input = _ref.input;
      return Promise.resolve(mutateAndGetPayload(input, context, info)).then(function (payload) {
        payload.clientMutationId = input.clientMutationId;
        return payload;
      });
    }
  };
}
});
unwrapExports(mutation);
var mutation_1 = mutation.mutationWithClientMutationId;

var node = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nodeDefinitions = nodeDefinitions;
exports.toGlobalId = toGlobalId;
exports.fromGlobalId = fromGlobalId;
exports.globalIdField = globalIdField;
function nodeDefinitions(idFetcher, typeResolver) {
  var nodeInterface = new graphql$1.GraphQLInterfaceType({
    name: 'Node',
    description: 'An object with an ID',
    fields: function fields() {
      return {
        id: {
          type: new graphql$1.GraphQLNonNull(graphql$1.GraphQLID),
          description: 'The id of the object.'
        }
      };
    },
    resolveType: typeResolver
  });
  var nodeField = {
    description: 'Fetches an object given its ID',
    type: nodeInterface,
    args: {
      id: {
        type: new graphql$1.GraphQLNonNull(graphql$1.GraphQLID),
        description: 'The ID of an object'
      }
    },
    resolve: function resolve(obj, _ref, context, info) {
      var id = _ref.id;
      return idFetcher(id, context, info);
    }
  };
  var nodesField = {
    description: 'Fetches objects given their IDs',
    type: new graphql$1.GraphQLNonNull(new graphql$1.GraphQLList(nodeInterface)),
    args: {
      ids: {
        type: new graphql$1.GraphQLNonNull(new graphql$1.GraphQLList(new graphql$1.GraphQLNonNull(graphql$1.GraphQLID))),
        description: 'The IDs of objects'
      }
    },
    resolve: function resolve(obj, _ref2, context, info) {
      var ids = _ref2.ids;
      return Promise.all(ids.map(function (id) {
        return Promise.resolve(idFetcher(id, context, info));
      }));
    }
  };
  return { nodeInterface: nodeInterface, nodeField: nodeField, nodesField: nodesField };
}
function toGlobalId(type, id) {
  return (0, base64_1.base64)([type, id].join(':'));
}
function fromGlobalId(globalId) {
  var unbasedGlobalId = (0, base64_1.unbase64)(globalId);
  var delimiterPos = unbasedGlobalId.indexOf(':');
  return {
    type: unbasedGlobalId.substring(0, delimiterPos),
    id: unbasedGlobalId.substring(delimiterPos + 1)
  };
}
function globalIdField(typeName, idFetcher) {
  return {
    description: 'The ID of an object',
    type: new graphql$1.GraphQLNonNull(graphql$1.GraphQLID),
    resolve: function resolve(obj, args, context, info) {
      return toGlobalId(typeName || info.parentType.name, idFetcher ? idFetcher(obj, context, info) : obj.id);
    }
  };
}
});
unwrapExports(node);
var node_1 = node.nodeDefinitions;
var node_2 = node.toGlobalId;
var node_3 = node.fromGlobalId;
var node_4 = node.globalIdField;

var plural = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pluralIdentifyingRootField = pluralIdentifyingRootField;
function pluralIdentifyingRootField(config) {
  var inputArgs = {};
  var inputType = config.inputType;
  if (inputType instanceof graphql$1.GraphQLNonNull) {
    inputType = inputType.ofType;
  }
  inputArgs[config.argName] = {
    type: new graphql$1.GraphQLNonNull(new graphql$1.GraphQLList(new graphql$1.GraphQLNonNull(inputType)))
  };
  return {
    description: config.description,
    type: new graphql$1.GraphQLList(config.outputType),
    args: inputArgs,
    resolve: function resolve(obj, args, context, info) {
      var inputs = args[config.argName];
      return Promise.all(inputs.map(function (input) {
        return Promise.resolve(config.resolveSingleInput(input, context, info));
      }));
    }
  };
}
});
unwrapExports(plural);
var plural_1 = plural.pluralIdentifyingRootField;

var lib = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, 'backwardConnectionArgs', {
  enumerable: true,
  get: function get() {
    return connection$1.backwardConnectionArgs;
  }
});
Object.defineProperty(exports, 'connectionArgs', {
  enumerable: true,
  get: function get() {
    return connection$1.connectionArgs;
  }
});
Object.defineProperty(exports, 'connectionDefinitions', {
  enumerable: true,
  get: function get() {
    return connection$1.connectionDefinitions;
  }
});
Object.defineProperty(exports, 'forwardConnectionArgs', {
  enumerable: true,
  get: function get() {
    return connection$1.forwardConnectionArgs;
  }
});
Object.defineProperty(exports, 'connectionFromArray', {
  enumerable: true,
  get: function get() {
    return arrayconnection.connectionFromArray;
  }
});
Object.defineProperty(exports, 'connectionFromArraySlice', {
  enumerable: true,
  get: function get() {
    return arrayconnection.connectionFromArraySlice;
  }
});
Object.defineProperty(exports, 'connectionFromPromisedArray', {
  enumerable: true,
  get: function get() {
    return arrayconnection.connectionFromPromisedArray;
  }
});
Object.defineProperty(exports, 'connectionFromPromisedArraySlice', {
  enumerable: true,
  get: function get() {
    return arrayconnection.connectionFromPromisedArraySlice;
  }
});
Object.defineProperty(exports, 'cursorForObjectInConnection', {
  enumerable: true,
  get: function get() {
    return arrayconnection.cursorForObjectInConnection;
  }
});
Object.defineProperty(exports, 'cursorToOffset', {
  enumerable: true,
  get: function get() {
    return arrayconnection.cursorToOffset;
  }
});
Object.defineProperty(exports, 'getOffsetWithDefault', {
  enumerable: true,
  get: function get() {
    return arrayconnection.getOffsetWithDefault;
  }
});
Object.defineProperty(exports, 'offsetToCursor', {
  enumerable: true,
  get: function get() {
    return arrayconnection.offsetToCursor;
  }
});
Object.defineProperty(exports, 'mutationWithClientMutationId', {
  enumerable: true,
  get: function get() {
    return mutation.mutationWithClientMutationId;
  }
});
Object.defineProperty(exports, 'nodeDefinitions', {
  enumerable: true,
  get: function get() {
    return node.nodeDefinitions;
  }
});
Object.defineProperty(exports, 'pluralIdentifyingRootField', {
  enumerable: true,
  get: function get() {
    return plural.pluralIdentifyingRootField;
  }
});
Object.defineProperty(exports, 'fromGlobalId', {
  enumerable: true,
  get: function get() {
    return node.fromGlobalId;
  }
});
Object.defineProperty(exports, 'globalIdField', {
  enumerable: true,
  get: function get() {
    return node.globalIdField;
  }
});
Object.defineProperty(exports, 'toGlobalId', {
  enumerable: true,
  get: function get() {
    return node.toGlobalId;
  }
});
});
unwrapExports(lib);

const { attributeFields, defaultListArgs, defaultArgs } = graphqlSequelize;
const { resolver, createConnectionResolver } = graphqlSequelize;
const { connectionArgs } = lib;
class SequelizeModel extends sequelize$1.Model {
  static init(options) {
    const ret = super.init(this.schema, options);
    ret.graphqlModel = new model(ret.name, attributeFields(ret), { description: `${ret.name} Model` });
    ret.graphqlConnection = new connection(ret.name + 'Connection', connectionArgs, createConnectionResolver({ target: ret }).resolveConnection, ret.graphqlModel.type);
    ret.onInit();
    return ret;
  }
  static belongsToMany(model, options) {
    const name = options.as || model.graphqlModel.type + 's';
    this[name] = super.belongsToMany(model, options);
    this.graphqlModel.addConnection(name, model.graphqlConnection.clone(createConnectionResolver({ target: this[name] }).resolveConnection));
    return this[name];
  }
  static belongsTo(model, options) {
    const name = options.as || model.graphqlModel.type;
    this[name] = super.belongsTo(model, options);
    this.graphqlModel.addAttribute(name, { resolver: resolver(this[name]), returnType: model.graphqlModel.type, description: `${name} of ${this.name}` });
    return this[name];
  }
  static hasMany(model, options) {
    const name = options.as || model.graphqlModel.type + 's';
    this[name] = super.hasMany(model, options);
    this.graphqlModel.addConnection(name, model.graphqlConnection.clone(createConnectionResolver({ target: this[name] }).resolveConnection));
    return this[name];
  }
  static hasOne(model, options) {
    const name = options.as || model.graphqlModel.type;
    this[name] = super.hasOne(model, options);
    this.graphqlModel.addAttribute(name, { resolver: resolver(this[name]), returnType: model.graphqlModel.type, description: `${this.name}'s ${name}` });
    return this[name];
  }
  static addAttr(name, options) {
    this.graphqlModel.addAttribute(name, options);
  }
  static gqAttrs(options) {
    return this.graphqlModel.getFilteredAttributes(options);
  }
  static addQuery(name, options) {
    this.graphqlModel.addQuery(name, options);
  }
  static addMutation(name, options) {
    this.graphqlModel.addMutation(name, options);
  }
  static gqArgs({ required, allowed } = {}) {
    return attrtypes(Object.assign(defaultArgs(this), defaultListArgs()), required, allowed);
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
      association: model[assocName],
      as: assocName
    }];
    if (assocs.length > 0) {
      include[0].include = this._assocsToInclude(assocs, false, model[assocName].target);
    }
    return include;
  }
}
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
      variableValues: variables,
      contextValue: context
    });
  }
}
var graphqlexecutor = GraphqlExecutor;

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

var constants = {
  fileHeader: '# THIS FILE WAS AUTOGENERATED BY SIFRR-API. DO NOT EDIT THIS FILE DIRECTLY. \n',
  timestampHeader: `# Genarated at ${new Date().toUTCString()} (${Date.now()}) \n`,
  fileSeparator: '#### Graphql Schema #### \n\n'
};

const { makeExecutableSchema } = graphqlTools;
const { fileHeader, timestampHeader, fileSeparator } = constants;
function getTypeDef(qs, resolvers) {
  for (let q in qs) {
    const qdet = qs[q];
    resolvers[q] = qdet.resolver;
  }
  return flatten(attrtypes(qs), '\n  ', true);
}
function createSchemaFromModels(models, { extra = '', queries = {}, mutations = {}, schemaPath } = {}) {
  const connections = {}, typeDefs = [], resolvers = {};
  for(let modelName in models) {
    const model = models[modelName];
    typeDefs.push(model.getSchema());
    Object.assign(queries, model.queries);
    Object.assign(mutations, model.mutations);
    resolvers[model.type] = resolvers[model.type] || {};
    Object.assign(resolvers[model.type], model.getResolvers());
    model.connections.forEach(conn => {
      connections[conn.type] = conn;
    });
  }
  for (let name in connections) {
    const conn = connections[name];
    typeDefs.push(conn.getSchema());
    resolvers[conn.type] = resolvers[conn.type] || {};
    Object.assign(resolvers[conn.type], conn.getResolvers());
  }
  const qnew = {}, mnew = {};
  const queryMut = `type Query {
  ${getTypeDef(queries, qnew)}
}

type Mutation {
  ${getTypeDef(mutations, mnew)}
}

scalar SequelizeJSON
scalar Date
${extra}`;
  typeDefs.unshift(queryMut);
  resolvers.Query = qnew;
  resolvers.Mutation = mnew;
  if (schemaPath) {
    mkdirp(path.dirname(schemaPath));
    const comment = fileHeader + timestampHeader + fileSeparator;
    const oldFileContent = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, { encoding: 'UTF-8' }).split(fileSeparator)[1] : null;
    const newFileContent = typeDefs.join('\n\n') + '\n';
    if (oldFileContent !== newFileContent) fs.writeFileSync(schemaPath, comment + newFileContent);
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
