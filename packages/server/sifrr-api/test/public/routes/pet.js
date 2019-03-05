const { reqToVariables } = require('../../../src/sifrr.api');

module.exports = {
  // basePath is optional, by default it is '', it can also be an array of basePaths like ['/v1', '/v2']
  // Each basePath should start from '/' but should not end with '/'
  // '/v1' means each path will have /api/v1 (from loadRoutes) /api is added from loadRoutes
  basePath: '/v1',
  post: {
    '/pet': (req, res) => {
      etg.resolve(`
        mutation($name: String!, $ownerId: Int!) {
          createPet(name: $name, ownerId: $ownerId) {
            id
            name
            owner {
              id
              name
            }
          }
        }
      `, reqToVariables(req, { allowed: ['name', 'ownerId'] }), { random: 1 }).then(data => res.json(data));
    }
  },
  get: {
    '/pets': (req, res) => {
      etg.resolve(`
        query($where: SequelizeJSON, $id: Int) {
          getPet(where: $where, id: $id) {
            id
            name
            owner {
              id
              name
            }
          }
        }
      `, reqToVariables(req, { allowed: ['where', 'id'] }), { random: 1 }).then(data => res.json(data));
    },
    '/pet/:id': (req, res) => {
      etg.resolve(`
        query($id: Int!) {
          getPet(id: $id) {
            id
            name
            owner {
              id
              name
            }
          }
        }
      `, reqToVariables(req), { random: 1 }).then(data => res.json(data));
    }
  }
};
