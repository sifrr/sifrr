process.env.NODE_PATH = require('path').join(__dirname, './node_modules');
require('module').Module._initPaths();
require('./config/setup')();

const path = require('path');
const { App } = require('@sifrr/server');
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize');
const { PubSub } = require('graphql-subscriptions');

const server = new App();

// this base path is added before each route (in addition to base paths defined in individual route files)
server.load(path.join(__dirname, './routes'), {
  basePath: '/api' /* , ignore: [ 'user.js' ] */
});

server.graphql('/graphql', global.graphqlSchema, {
  contextFxn: () => ({
    [EXPECTED_OPTIONS_KEY]: createContext(require('./sequelize').sequelize),
    random: 1,
    pubsub: new PubSub()
  })
});

server.file('/graphiql', path.join(__dirname, './graphiql.html'));
server.file('/', path.join(__dirname, './graphiql.html'));

module.exports = server;
