const fs = require('fs');
const path = require('path');

function loadRoutes(app, dir, filter = []) {
  fs
    .readdirSync(dir)
    .filter(file =>
      path.extname(file) === '.js' &&
      filter.indexOf(file) < 0
    )
    .forEach((file) => {
      const routes = require(path.join(dir, file));
      let basePath = routes.basePath || '';
      delete routes.basePath;
      if (typeof basePath === 'string') basePath = [basePath];

      basePath.forEach((basep) => {
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
