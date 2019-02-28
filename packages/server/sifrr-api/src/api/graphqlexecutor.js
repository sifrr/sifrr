const { graphql } = require('graphql');

class GraphqlExecutor {
  constructor(executableSchema) {
    this._schema = executableSchema;
    this._middlewares = [];
  }

  resolve(query, variables, context = {}) {
    return graphql({
      schema: this._schema,
      source: query,
      variables,
      contextValue: context
    });
  }
}

module.exports = GraphqlExecutor;
