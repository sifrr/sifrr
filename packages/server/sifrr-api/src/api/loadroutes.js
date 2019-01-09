const fs = require('fs');
const path = require('path');

function loadRoutes(app, dir, { ignore = [], basePath = '' }) {
  fs
    .readdirSync(dir)
    .filter(file =>
      path.extname(file) === '.js' &&
      ignore.indexOf(file) < 0
    )
    .forEach((file) => {
      const routes = require(path.join(dir, file));
      let defaultBasePath;
      if (typeof basePath === 'string') defaultBasePath = [basePath];
      let basePaths = routes.basePath || '';
      delete routes.basePath;
      if (typeof basePaths === 'string') basePaths = [basePath];

      basePath.concat(defaultBasePath).forEach((basep) => {
        for (let method in routes) {
          const methodRoutes = routes[method];
          for (let r in methodRoutes) {
            app[method](basep + r, methodRoutes[r]);
          }
        }
      });
    });

  return app;
}

module.exports = loadRoutes;
