const filter = require('../utils/filterobject');

function reqToVariables(req, { allowed = [] } = {}) {
  let args = {};
  Object.assign(args, req.query, req.body, req.params);

  if (allowed.length > 0) args = filter(args, arg => allowed.indexOf(arg) >= 0);

  for (let arg in args) {
    try {
      args[arg] = JSON.parse(args[arg]);
    } catch (e) {
      // Do nothing if it is not valid json
    }
  }

  return args;
}

module.exports = reqToVariables;
