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
        return fakeDatabase[id];
      }
    }
  }
});

module.exports = new graphql.GraphQLSchema({ query: queryType });
