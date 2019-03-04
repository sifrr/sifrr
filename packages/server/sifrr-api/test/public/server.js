require('./config/setup')();

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressGraphql = require('express-graphql');
const { loadRoutes } = require('@sifrr/api');
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize');
let port = false;
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'));
if (index !== -1) {
  port = +process.argv[index + 1];
}

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

server.use('/graphql', expressGraphql({
  schema: graphqlSchema,
  graphiql: true,
  context: { [EXPECTED_OPTIONS_KEY]: createContext(require('./sequelize').sequelize), random: 1 }
}));

if (ENV === 'development') {
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
</body>`
    );
  });
}

function sss(p) {
  return server.listen(p, () => {
    process.stdout.write('Server is running on localhost:1111 \n');
  });
}

if (port) {
  sss(port);
}

module.exports = sss;
