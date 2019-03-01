const { attributeFields, defaultListArgs, defaultArgs } = require('graphql-sequelize');
const { resolver } = require('graphql-sequelize');
const Sequelize = require('sequelize');
const attrsToTypes = require('../attrstotypes');

class SequelizeModel extends Sequelize.Model {
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

  static get gqDescription() {
    return `${this.name} model`;
  }

  static addAttr(name, options /* = { args, resolver, returnType, description } */) {
    // args = { "id": "Int", "name": "String" }
    this.gqExtraAttrs[this.gqName][name] = options;
  }

  static addQuery(name, options) {
    this.gqQuery[this.gqName][name] = options;
  }

  static addMutation(name, options) {
    this.gqMutations[this.gqName][name] = options;
  }

  static gqSchema() {
    return this.gqSchemaAttrs();
  }

  static gqAttrs({ required, allowed } = {}) {
    return attrsToTypes(attributeFields(this), required, allowed);
  }

  static gqArgs({ required, allowed } = {}) {
    return attrsToTypes(Object.assign(defaultArgs(this), defaultListArgs()), required, allowed);
  }

  static gqSchemaAttrs({ required, allowed } = {}) {
    // Fields - arguments and associations
    const args = attributeFields(this);
    const assocs = this.gqAssociations[this.gqName];
    const extras = this.gqExtraAttrs[this.gqName];
    return attrsToTypes(Object.assign(args, assocs, extras), required, allowed);
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

module.exports = SequelizeModel;
