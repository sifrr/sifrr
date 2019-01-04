function filter(json, fxn) {
  const res = {};
  for (let k in json) {
    if (fxn(k)) res[k] = json[k];
  }
  return res;
}

function reqToGraphqlArgs(req, { allowed = [] } = {}) {
  let args = {};
  Object.assign(args, req.body, req.params);

  if (allowed.length > 0) args = filter(args, (arg) => allowed.indexOf(arg) >= 0);

  for (let arg in args) {
    try {
      args[arg] = JSON.parse(args[arg]);
    } catch(e) {
      // Do nothing if it is not json
    }
  }

  const ret = JSON.stringify(args).slice(1, -1).replace(/"([^(")"]+)":/g,'$1:');
  return ret ? `(${ret})` : '';
}

module.exports = reqToGraphqlArgs;
