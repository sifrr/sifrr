const currentDate = require('../currentdate');

module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 1,
          name: 'Aadi',
          createdAt: currentDate(),
          updatedAt: currentDate()
        },
        {
          id: 2,
          name: 'John',
          createdAt: currentDate(),
          updatedAt: currentDate()
        },
        {
          id: 3,
          name: 'Sifrr',
          createdAt: currentDate(),
          updatedAt: currentDate()
        }
      ],
      {}
    );
  }
};
