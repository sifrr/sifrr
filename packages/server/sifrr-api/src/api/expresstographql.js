const { graphql } = require('graphql');

class ExpressToGraphql {
  constructor(schema) {
    this._schema = schema;
    this._middlewares = [];
  }

  resolve(req, query, context = {}) {
    this._middlewares.forEach((m) => {
      m(req, context);
    });

    return graphql({
      schema: this._schema,
      source: query,
      contextValue: context
    });
  }

  use(fxn) {
    this._middlewares.push(fxn);
  }
}

module.exports = ExpressToGraphql;
