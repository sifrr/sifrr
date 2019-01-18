const fs = require('fs');
const path = require('path');

function loadRoutes(app, dir, { ignore = [], basePath = '' }) {
  const paths = [];

  fs
    .readdirSync(dir)
    .filter(file =>
      path.extname(file) === '.js' &&
      ignore.indexOf(file) < 0
    )
    .forEach((file) => {
      const routes = require(path.join(dir, file));
      let basePaths = routes.basePath || '';
      delete routes.basePath;
      if (typeof basePaths === 'string') basePaths = [basePaths];

      basePaths.forEach((basep) => {
        for (let method in routes) {
          const methodRoutes = routes[method];
          for (let r in methodRoutes) {
            app[method](basePath + basep + r, methodRoutes[r]);
            paths.push(basePath + basep + r);
          }
        }
      });
    });

  return paths;
}

module.exports = loadRoutes;
