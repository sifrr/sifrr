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
    this.graphqlModel.addAttribute(name, { resolver: resolver(model), returnType: model.graphqlModel.type, description: `${name} of ${this.name}` });
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
    this.graphqlModel.addAttribute(name, { resolver: resolver(model), returnType: model.graphqlModel.type, description: `${this.name}'s ${name}` });
    return this[name];
  }

  static addAttr(name, options /* = { args, resolver, returnType, description } */) {
    // args = { "id": "Int", "name": "String" }
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
    return attrsToTypes(Object.assign(defaultArgs(this), defaultListArgs()), required, allowed);
  }

  static get resolvers() {
    const q = { Query: this.gqQuery[this.gqName], Mutation: this.gqMutations[this.gqName] };

    q[this.gqName] = {};

    // Associations
    for (let a in this.gqAssociations[this.gqName]) {
      const assoc = this.gqAssociations[this.gqName][a];
      q[this.gqName][a] = assoc.resolver;
    }

    // Extra
    for (let a in this.gqExtraAttrs[this.gqName]) {
      const attr = this.gqExtraAttrs[this.gqName][a];
      q[this.gqName][a] = attr.resolver;
    }

    return q;
  }

  // Default Resolvers - getQuery, createMutation, updateMutation, upsertMutation, deleteMutation
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
      model: model[assocName],
      as: assocName
    }];
    if (assocs.length > 0) {
      include[0].include = this._assocsToInclude(assocs, false, model[assocName]);
    }
    return include;
  }
}

module.exports = SequelizeModel;
