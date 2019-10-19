const { App, writeHeaders } = require('@sifrr/server');

const server = new App();

server.get('/404', res => {
  res.writeStatus('404 Not Found');
  res.end();
});

server.post('/post', async res => {
  res.onAborted(global.console.error);
  const body = await res.body();
  writeHeaders(res, {
    'content-type': 'application/json'
  });
  res.end(body);
});

server.get('timeout', async res => {
  res.onAborted(global.console.error);
  await new Promise(res => setTimeout(res, 1000));
  res.end('');
});

// graphql
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();
const graphql = require('graphql');

const fakeDatabase = {
  a: {
    id: 'a',
    name: 'alice'
  },
  b: {
    id: 'b',
    name: 'bob'
  }
};

const userType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString }
  }
});

// Define the Query type
const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      // `args` describes the arguments that the `user` query accepts
      args: {
        id: { type: graphql.GraphQLString }
      },
      resolve: function(_, { id }) {
        pubsub.publish('ID', { user: fakeDatabase[id] });
        return fakeDatabase[id];
      }
    }
  }
});

// Define the Subscription type
const subscriptionType = new graphql.GraphQLObjectType({
  name: 'Subscription',
  fields: {
    user: {
      type: userType,
      subscribe(_, __, { pubsub }) {
        return pubsub.asyncIterator('ID');
      }
    }
  }
});

const schema = new graphql.GraphQLSchema({ query: queryType, subscription: subscriptionType });

server.graphql(
  '/graphql',
  schema,
  { contextValue: { pubsub }, graphiqlPath: '/graphiql' },
  {},
  graphql
);

module.exports = server;
