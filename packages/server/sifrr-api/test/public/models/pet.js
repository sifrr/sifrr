const { sequelize, Sequelize } = require('../sequelize');
const { SequelizeModel } = require('../../../src/sifrr.api');

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

  // attrs, query, mutations
  static get queries() {
    return {
      getPet: {
        args: this.gqArgs(),
        // customResolver need to bind static functions resolvers with this class, else it won't work
        resolver: this.customResolver.bind(this),
        type: [this.graphqlModel],
        description: 'Get one Pet.'
      }
    };
  }

  static get mutations() {
    return {
      [`create${this.graphqlModel.name}`]: {
        args: this.gqAttrs({
          required: ['name', 'ownerId'],
          allowed: ['name', 'ownerId']
        }),
        resolver: this.createMutationResolver.bind(this),
        type: this.graphqlModel
      },
      createPetAndOwner: {
        args: [{ name: 'name', type: 'String!' }, { name: 'owner__name', type: 'String!' }],
        resolver: this.createMutationResolver.bind(this),
        type: this.graphqlModel
      },
      [`update${this.graphqlModel.name}`]: {
        args: this.gqAttrs({ allowed: ['id'], required: ['id'] }),
        resolver: this.updateMutationResolver.bind(this),
        type: this.graphqlModel
      },
      [`upsert${this.graphqlModel.name}`]: {
        args: this.gqAttrs({ allowed: ['id'], required: ['id'] }),
        resolver: this.upsertMutationResolver.bind(this),
        type: this.graphqlModel
      },
      [`delete${this.graphqlModel.name}`]: {
        args: this.gqAttrs({ allowed: ['id'], required: ['id'] }),
        resolver: this.deleteMutationResolver.bind(this),
        type: 'Int'
      }
    };
  }

  static get extraAttributes() {
    return {
      type: {
        resolver: (_, args) => {
          return args.type + _.name;
        },
        args: [{ name: 'type', type: 'String' }],
        type: 'String',
        description: 'Random attribute'
      }
    };
  }

  static onInit() {
    // Add description
    this.graphqlModel.description = 'A pet';

    // don't add createdAt, updatedAt to schema, and allow extra field 'type'
    // this.graphqlModel.filterAttributes({
    //   required: ['name', 'ownerId'],
    //   allowed: ['id', 'name', 'ownerId', 'owner', 'type']
    // });

    // Add extra attributes to pet connection
    this.graphqlConnection.addField({
      name: 'total',
      resolver: _ => {
        return _.source.countPets();
      },
      type: 'Int',
      description: 'Total pets'
    });

    // Add extra arguments to pet connection
    // this.graphqlConnection.addArgument('orderBy', '[[String]] = [["name", "ASC"]]');
    this.graphqlConnection.description = 'Pet connection';
    this.addConnectionQuery('petConn');
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
