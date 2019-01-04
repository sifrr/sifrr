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
      const routes = require(path.join(__dirname, file));
      for (let method in routes) {
        const methodRoutes = routes[method];
        for (let r in methodRoutes) {
          app[method](r, methodRoutes[r]);
        }
      }
    });

  return app;
}

module.exports = loadRoutes;
