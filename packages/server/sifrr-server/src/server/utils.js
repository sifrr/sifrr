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
    who[prop] = from.prototype[prop].bind(who);
  });
}

module.exports = {
  writeHeaders,
  extend
};
