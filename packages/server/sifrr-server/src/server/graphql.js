const queryString = require('query-string');

module.exports = function graphqlRoute(schema, contextFxn = () => undefined) {
  const { graphql } = require('graphql');

  return async (res, req) => {
    res.onAborted(console.error);

    // query and variables
    const queryParams = queryString.parse(req.getQuery());
    let { query, variables } = queryParams;
    if (typeof variables === 'string') variables = JSON.parse(variables);

    if (typeof res.json === 'function') {
      const data = await res.json();
      query = data.query || query;
      variables = data.variables || variables;
    }

    // context
    let context = contextFxn(res, req);
    if (typeof context === 'object' && context.constructor.name === 'Promise')
      context = await context;

    res.writeHeader('content-type', 'application/json');
    res.end(
      JSON.stringify(
        await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: context
        })
      )
    );
  };
};
