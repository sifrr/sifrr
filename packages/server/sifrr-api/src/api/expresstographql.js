const { graphql } = require('graphql');

class ExpressToGraphql {
  constructor(schema) {
    this._schema = schema;
    this._middlewares = [];
  }

  resolve(req, res, query, context = {}) {
    this._middlewares.forEach((m) => {
      m(res, res, context);
    });

    return graphql({
      schema: this._schema,
      source: query,
      contextValue: context
    }).then(data => res.json(data));
  }

  use(fxn) {
    this._middlewares.push(fxn);
  }
}

module.exports = ExpressToGraphql;
