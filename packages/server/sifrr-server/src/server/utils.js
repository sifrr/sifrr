function writeHeaders(res, headers, other) {
  if (typeof other !== 'undefined') {
    res.writeHeader(headers, other.toString());
  } else {
    for (let n in headers) {
      res.writeHeader(n, headers[n].toString());
    }
  }
}

function extend(who, from) {
  const ownProps = Object.getOwnPropertyNames(from.prototype);
  ownProps.forEach(prop => {
    if (prop === 'constructor') return;
    if (who[prop]) {
      who[`_${prop}`] = who[prop];
    }
    if (typeof from.prototype[prop] === 'function') who[prop] = from.prototype[prop].bind(who);
    else who[prop] = from.prototype[prop];
  });
}

module.exports = {
  writeHeaders,
  extend
};
