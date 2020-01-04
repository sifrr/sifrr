const { graphql } = require('graphql');

class GraphqlExecutor {
  constructor(executableSchema) {
    this._schema = executableSchema;
  }

  resolve(query, variables, context = {}) {
    return graphql({
      schema: this._schema,
      source: query,
      variableValues: variables,
      contextValue: context
    });
  }
}

module.exports = GraphqlExecutor;
