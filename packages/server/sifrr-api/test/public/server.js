process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();
require('./config/setup')();

const { reqToVariables } = require('../../src/sifrr.api');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { loadRoutes } = require('../../src/sifrr.api');
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize');

const server = express();

// Show total request time
if (ENV === 'development') {
  let time;
  server.use(function (req, res, next) {
    time = Date.now();
    function afterResponse() {
      res.removeListener('finish', afterResponse);

      // action after response
      global.console.log('\x1b[36m%s\x1b[0m', `Request '${req.originalUrl}' took: ${Date.now() - time}ms`);
    }

    res.on('finish', afterResponse);

    // action before request
    next();
  });
}

server.use('/*', (req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Method': 'POST',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Expose-Headers': 'content-length'
  });
  next();
});

server.options('/*', (req, res) => {
  res.status(200).send();
});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}));

// this base path is added before each route (in addition to base paths defined in individual route files)
loadRoutes(server, path.join(__dirname, './routes'), { basePath: '/api' /* , ignore: [ 'user.js' ] */ });

server.post('/graphql', (req, res) => {
  const vars = reqToVariables(req, { allowed: ['query', 'variables'] });
  etg.resolve(vars.query, vars.variables, { [EXPECTED_OPTIONS_KEY]: createContext(require('./sequelize').sequelize), random: 1 }).then((resp) => res.json(resp));
});

server.get('/sifrr.fetch.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../../browser/sifrr-fetch/dist/sifrr.fetch.min.js'));
});

server.get('/graphiql', (req, res) => {
  res.sendFile(path.join(__dirname, './graphiql.html'));
});

if (ENV === 'development' || ENV === 'test') {
  server.use(function(req, res){
    res.status(404);

    let availRoutes = '';
    server._router.stack.forEach(function(a){
      const route = a.route;
      if(route){
        route.stack.forEach(function(r){
          const method = r.method.toUpperCase();
          availRoutes += `<tr><td><strong>${method}</strong></td><td>${method == 'GET' ? `<a href="${route.path}">` : ''}${route.path}</a></td><tr>`;
        });
      }
    });

    res.send(`<body">
<h4>Not found.<h4>

<h4>Available Routes:</h4>
<table>
<tbody>
${availRoutes}
</tbody>
</table>
<script src="/sifrr.fetch.js" charset="utf-8"></script>
</body>`
    );
  });
}

let ss;

module.exports = {
  listen: (port) => ss = server.listen(port),
  close: () => {
    ss && ss.close();
  }
};
