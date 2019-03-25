const fs = require('fs');
const path = require('path');

function loadRoutes(app, dir, { filter = () => true, basePath = '' } = {}) {
  let files;
  const paths = [];

  if (fs.statSync(dir).isDirectory()) {
    files = fs
      .readdirSync(dir)
      .filter(filter).map(file => path.join(dir, file));
  } else {
    files = [dir];
  }

  files.forEach((file) => {
    if (fs.statSync(file).isDirectory()) {
      // Recursive if directory
      paths.push(...loadRoutes(app, file, { filter, basePath }));
    } else if (path.extname(file) === '.js') {
      const routes = require(file);
      let basePaths = routes.basePath || [''];
      delete routes.basePath;
      if (typeof basePaths === 'string') basePaths = [basePaths];

      basePaths.forEach((basep) => {
        for (const method in routes) {
          const methodRoutes = routes[method];
          for (let r in methodRoutes) {
            if (!Array.isArray(methodRoutes[r])) methodRoutes[r] = [methodRoutes[r]];
            app[method](basePath + basep + r, ...methodRoutes[r]);
            paths.push(basePath + basep + r);
          }
        }
      });
    }
  });

  return paths;
}

module.exports = loadRoutes;
