const currentDate = require('../currentdate');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('Pets', [
      {
        id: 1,
        name: 'Lucy',
        ownerId: 1,
        createdAt: currentDate(),
        updatedAt: currentDate()
      },
      {
        id: 2,
        name: 'Liliam',
        ownerId: 1,
        createdAt: currentDate(),
        updatedAt: currentDate()
      },
      {
        id: 3,
        name: 'Billu',
        ownerId: 2,
        createdAt: currentDate(),
        updatedAt: currentDate()
      }
    ], {});
  }
};
