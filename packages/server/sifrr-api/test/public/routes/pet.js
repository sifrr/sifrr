const { getQuery, writeHeaders } = require('@sifrr/server');

function setHeaders(res) {
  writeHeaders(res, {
    'content-type': 'application/json'
  });
}

module.exports = {
  // basePath is optional, by default it is '', it can also be an array of basePaths like ['/v1', '/v2']
  // Each basePath should start from '/' but should not end with '/'
  // '/v1' means each path will have /api/v1 (from loadRoutes) /api is added from loadRoutes
  basePath: '/v1',
  post: {
    '/pet': (res, req) => {
      res.onAborted(console.error);
      setHeaders(res);
      etg
        .resolve(
          `
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
      `,
          getQuery(req),
          { random: 1 }
        )
        .then(data => res.end(JSON.stringify(data)));
    },
    '/petAndOwner': (res, req) => {
      res.onAborted(console.error);
      setHeaders(res);
      etg
        .resolve(
          `
        mutation($name: String!, $owner__name: String!) {
          createPetAndOwner(name: $name, owner__name: $owner__name) {
            id
            name
            owner {
              id
              name
            }
          }
        }
      `,
          getQuery(req),
          { random: 1 }
        )
        .then(data => res.end(JSON.stringify(data)));
    }
  },
  get: {
    '/pets': (res, req) => {
      res.onAborted(console.error);
      setHeaders(res);
      etg
        .resolve(
          `
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
      `,
          (getQuery(req).where || getQuery(req).id) && {
            where: getQuery(req).where ? JSON.parse(getQuery(req).where) : null,
            id: getQuery(req).id ? parseInt(getQuery(req).id) : null
          },
          { random: 1 }
        )
        .then(data => res.end(JSON.stringify(data)));
    },
    '/pet/:id': (res, req) => {
      res.onAborted(console.error);
      setHeaders(res);
      etg
        .resolve(
          `
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
      `,
          {
            id: parseInt(req.getParameter(0))
          },
          { random: 1 }
        )
        .then(data => res.end(JSON.stringify(data)));
    }
  }
};
