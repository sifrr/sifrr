const { App, writeHeaders } = require('@sifrr/server');

const server = new App();

server.get('/404', (res) => {
  res.writeStatus('404 Not Found');
  res.end();
});

server.post('/post', async (res) => {
  const body = await res.body();
  writeHeaders(res, {
    'content-type': 'application/json'
  });
  res.end(body);
});

server.get('timeout', async (res) => {
  await new Promise((res) => setTimeout(res, 1000));
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

const messageType = new graphql.GraphQLObjectType({
  name: 'Message',
  fields: {
    message: { type: graphql.GraphQLString },
    channel: { type: graphql.GraphQLString },
    User: { type: userType }
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
      resolve: function (_, { id }) {
        pubsub.publish('ID', { user: fakeDatabase[id] });
        return fakeDatabase[id];
      }
    },
    message: {
      type: graphql.GraphQLBoolean,
      // `args` describes the arguments that the `user` query accepts
      args: {
        message: { type: graphql.GraphQLString },
        userId: { type: graphql.GraphQLString },
        channel: { type: graphql.GraphQLString }
      },
      resolve: function (_, { message, channel, userId }) {
        pubsub.publish(`${channel}_message`, {
          chat: { User: { id: userId, name: userId }, message, channel }
        });
        return true;
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
    },
    chat: {
      type: messageType,
      // `args` describes the arguments that the `user` query accepts
      args: {
        channel: { type: graphql.GraphQLString }
      },
      subscribe(_, { channel }, { pubsub }) {
        return pubsub.asyncIterator(`${channel}_message`);
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
