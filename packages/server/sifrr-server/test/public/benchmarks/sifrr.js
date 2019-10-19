const { App, writeHeaders } = require('../../../src/sifrr.server');
const path = require('path');
const memoryCache = require('cache-manager').caching({ store: 'memory', max: 100, ttl: 0 });

const app = new App();
const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*',
  Connection: 'keep-alive'
};

app.folder('', path.join(__dirname, 'public/compress'), {
  headers,
  compress: true
});

app.file('/random/:pattern', path.join(__dirname, 'public/random.html'), {
  headers
});

app.options('/*', res => {
  writeHeaders(res, headers);
  writeHeaders(res, 'access-control-allow-headers', 'content-type');
  res.end();
});

app.get('/empty', res => {
  res.end();
});

app.post('/stream', res => {
  res.onAborted(err => {
    if (err) throw Error(err);
  });

  for (let h in headers) {
    writeHeaders(res, h, headers[h]);
  }
  res.writeHeader('content-type', 'application/json');
  if (typeof res.formData === 'function') {
    res
      .formData({
        // onFile pr tmpDir required else promise will not resolve if there are files
        onFile: (fieldname, file) => {
          file.resume();
        },
        onField: () => {}
      })
      .then(resp => {
        res.end(JSON.stringify(resp));
      });
  }
});

app.post('/tmpdir', res => {
  res.onAborted(err => {
    if (err) throw Error(err);
  });

  for (let h in headers) {
    writeHeaders(res, h, headers[h]);
  }
  res.writeHeader('content-type', 'application/json');
  if (typeof res.formData === 'function') {
    res
      .formData({
        tmpDir: path.join(__dirname, './public/tmp'),
        filename: f => (f.indexOf('all.js') > -1 ? 'some.js' : f)
      })
      .then(resp => {
        res.end(JSON.stringify(resp));
      });
  }
});

app.load(path.join(__dirname, './routes'));
app.load(path.join(__dirname, './routes/prefix.js'));

app.file('/cache.html', path.join(__dirname, 'public/cache.html'), {
  headers,
  cache: memoryCache,
  overwriteRoute: true
});

app.file('/cache_compress', path.join(__dirname, 'public/cache.html'), {
  headers,
  cache: memoryCache,
  compress: true
});

app.folder('/', path.join(__dirname, '../'), {
  filter: path => path.indexOf('node_modules') < 0 && path.indexOf('benchmarks') < 0,
  watch: true,
  livereload: true
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

app.graphql(
  '/graphql',
  schema,
  { contextValue: { pubsub }, graphiqlPath: '/graphiql' },
  {},
  graphql
);

module.exports = app;
