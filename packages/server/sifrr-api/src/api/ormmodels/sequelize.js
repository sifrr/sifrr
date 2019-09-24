const { connectionArgs } = require('graphql-relay');
const { attributeFields, defaultListArgs, defaultArgs } = require('graphql-sequelize');
const { resolver, createConnectionResolver } = require('graphql-sequelize');
const Sequelize = require('sequelize');

const { graphqlObjectToType } = require('../graphqljsconverter');
const GqModel = require('../graphql/types/objects/modeltype');
const GqConnection = require('../graphql/types/objects/connectiontype');
const gqSchema = new (require('../graphql/types/schematype'))();
const gqQuery = new (require('../graphql/types/objects/querytype'))();
const gqMutation = new (require('../graphql/types/objects/mutationtype'))();

gqSchema.addObject(gqQuery);
gqSchema.addObject(gqMutation);

class SequelizeModel extends Sequelize.Model {
  static init(options) {
    const ret = super.init(this.schema, options);
    ret.graphqlModel = new GqModel(ret.name, {
      fields: graphqlObjectToType(attributeFields(ret)),
      description: `${ret.name} Model`
    });
    ret.graphqlConnection = new GqConnection(ret.name + 'Connection', {
      // fields: connectionArgs,
      resolver: createConnectionResolver({ target: ret }).resolveConnection,
      edgeType: ret.graphqlModel
    });
    gqSchema.addObject(ret.graphqlModel);
    gqSchema.addObject(ret.graphqlConnection);
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
      this.graphqlModel.addField({
        name,
        type: model.graphqlConnection,
        resolver: createConnectionResolver({ target: this[name] }).resolveConnection
      });
    } else {
      this.graphqlModel.addField({
        name,
        type: model.graphqlModel,
        resolver: resolver(this[name])
      });
    }
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
  static gqAttrs() {
    return this.graphqlModel.fields;
  }

  static gqArgs() {
    return graphqlObjectToType(Object.assign(defaultArgs(this), defaultListArgs()), true);
  }

  // aliases on model, connection
  static addAttr(name, options) {
    this.graphqlModel.addField({ name, ...options });
  }

  static addQuery(name, options) {
    gqQuery.addField({ name, ...options });
  }

  static addMutation(name, options) {
    gqMutation.addField({ name, ...options });
  }

  static addConnectionQuery(name) {
    gqQuery.addField({
      name,
      args: graphqlObjectToType(connectionArgs),
      type: this.graphqlConnection
    });
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
      before: findOptions => {
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
    const include = [
      {
        association: model[assocName],
        as: assocName
      }
    ];
    if (assocs.length > 0) {
      include[0].include = this._assocsToInclude(assocs, false, model[assocName].target);
    }
    return include;
  }
}

Sequelize.gqSchema = gqSchema;
module.exports = SequelizeModel;
