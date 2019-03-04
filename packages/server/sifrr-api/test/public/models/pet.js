const { sequelize, Sequelize } = require('../sequelize');
const SequelizeModel = require('../../../src/api/ormmodels/sequelize');

class Pet extends SequelizeModel {
  static init() {
    return super.init({ tableName: 'Pets', sequelize });
  }

  static get schema() {
    return {
      name: Sequelize.STRING,
      ownerId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' }
      }
    };
  }

  static associate(models) {
    this.belongsTo(models.User, {
      as: 'owner',
      foreignKey: 'ownerId'
    });
  }

  static onInit() {
    const me = this;
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

module.exports = Pet.init();
