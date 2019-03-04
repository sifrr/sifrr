'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Pets', 'ownerId', {
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Pets', 'ownerId', {
      type: Sequelize.INTEGER
    });
  }
};
