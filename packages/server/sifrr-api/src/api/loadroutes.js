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
      if (basePath[0] && basePath[0] !== '/') basePath = '/' + basePath;
      delete routes.basePath;
      for (let method in routes) {
        const methodRoutes = routes[method];
        for (let r in methodRoutes) {
          app[method](basePath + r, methodRoutes[r]);
        }
      }
    });

  return app;
}

module.exports = loadRoutes;
