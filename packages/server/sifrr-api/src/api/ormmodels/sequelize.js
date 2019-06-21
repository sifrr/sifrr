const { attributeFields, defaultListArgs, defaultArgs } = require('graphql-sequelize');
const { resolver, createConnectionResolver } = require('graphql-sequelize');
const Sequelize = require('sequelize');
const attrsToTypes = require('../attrtypes');
const GqModel = require('../graphql/model');
const GqConnection = require('../graphql/connection');
const { connectionArgs } = require('graphql-relay');

class SequelizeModel extends Sequelize.Model {
  static init(options) {
    const ret = super.init(this.schema, options);
    ret.graphqlModel = new GqModel(ret.name, attributeFields(ret), { description: `${ret.name} Model` });
    ret.graphqlConnection = new GqConnection(ret.name + 'Connection', connectionArgs, createConnectionResolver({ target: ret }).resolveConnection, ret.graphqlModel.type);
    ret._onInit();
    return ret;
  }

  // Connections/Associations
  static belongsToMany(model, options) {
    return this.graphqlAssoc('belongsToMany', model, options, true);
  }

  static belongsTo(model, options) {
    return this.graphqlAssoc('belongsTo', model, options, false);
  }

  static hasMany(model, options) {
    return this.graphqlAssoc('hasMany', model, options, true);
  }

  static hasOne(model, options) {
    return this.graphqlAssoc('hasOne', model, options, false);
  }

  static graphqlAssoc(type, model, options, multiple) {
    const name = options.as || model.graphqlModel.type + (multiple ? 's' : '');
    this[name] = super[type](model, options);
    if (options.useConnection) {
      const conn = model.graphqlConnection.clone(createConnectionResolver({ target: this[name] }).resolveConnection);
      conn.description = options.description;
      this.graphqlModel.addConnection(name, conn);
    } else
      this.graphqlModel.addAttribute(name, { resolver: resolver(this[name]), returnType: model.graphqlModel.type, description: options.description });
    return this[name];
  }

  // on init simple method to add attributes, queries, mutations
  static _onInit() {
    for (let q in this.queries) this.addQuery(q, this.queries[q]);
    for (let m in this.mutations) this.addMutation(m, this.mutations[m]);
    for (let a in this.extraAttributes) this.addAttr(a, this.extraAttributes[a]);
    this.onInit();
  }

  static get queries() {
    return {};
  }

  static get mutations() {
    return {};
  }

  static get extraAttributes() {
    return {};
  }

  // get attributes, arguments
  static gqAttrs(options) {
    return this.graphqlModel.getFilteredAttributes(options);
  }

  static gqArgs({ required, allowed } = {}) {
    return attrsToTypes(Object.assign(defaultArgs(this), defaultListArgs()), required, allowed);
  }

  // aliases on model, connection
  static addAttr(name, options) {
    this.graphqlModel.addAttribute(name, options);
  }

  static addQuery(name, options) {
    this.graphqlModel.addQuery(name, options);
  }

  static addMutation(name, options) {
    this.graphqlModel.addMutation(name, options);
  }

  static addConnectionQuery(name) {
    this.graphqlModel.addConnectionQuery(name, this.graphqlConnection);
  }

  // Default Resolvers - getQuery, createMutation, updateMutation, upsertMutation, deleteMutation
  static getQueryResolver(_, args, ctx, info) {
    const include = [];
    for (let arg in args.where) {
      if (arg.indexOf('__') >= 0) {
        const assocs = arg.split('__');
        args.where['$' + assocs.join('.') + '$'] = args.where[arg];
        include.push(...this._assocsToInclude(assocs));
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
    const include = [];
    for (let arg in args) {
      if (arg.indexOf('__') >= 0) {
        const assocs = arg.split('__');
        args[assocs[0]] = args[assocs[0]] || {};
        args[assocs[0]][assocs[1]] = args[arg];
        include.push(...this._assocsToInclude(assocs));
        delete args[arg];
      }
    }
    return this.create(args, { include });
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

  // private
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

module.exports = SequelizeModel;
