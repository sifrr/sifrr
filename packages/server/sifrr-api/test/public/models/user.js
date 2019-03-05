const { sequelize, Sequelize } = require('../sequelize');
const { SequelizeModel } = require('../../../src/sifrr.api');

class User extends SequelizeModel {
  static init() {
    return super.init({ tableName: 'Users', sequelize });
  }

  static get gqDescription() {
    return 'A User';
  }

  static get schema() {
    return {
      name: Sequelize.STRING
    };
  }

  static associate(models) {
    this.hasMany(models.Pet, {
      as: 'pets',
      foreignKey: 'ownerId'
    });
  }

  static onInit() {
    // getQuery Resolver
    this.addQuery(this.graphqlModel.type, {
      args: this.gqArgs(),
      resolver: this.getQueryResolver.bind(this),
      returnType: `[${this.graphqlModel.type}]`
    });

    // Mutations
    this.addMutation(`create${this.graphqlModel.type}`, {
      args: this.gqAttrs({
        required: ['name'],
        allowed: ['name']
      }),
      resolver: this.createMutationResolver.bind(this),
      returnType: this.graphqlModel.type
    });
  }
}

module.exports = User.init();
