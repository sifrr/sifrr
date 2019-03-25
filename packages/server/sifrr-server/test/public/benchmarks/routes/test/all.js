const path = require('path');

const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*'
};

module.exports = {
  folder: {
    '/': [path.join(__dirname, '../../public'), { headers, compress: false }]
  },
  post: {
    '/json': res => {
      res.onAborted(err => { if (err) throw Error(err); });
      res.writeHeader('access-control-allow-origin', '*');
      res.writeHeader('content-type', 'application/json');

      if (typeof res.json === 'function') {
        res.json().then(resp => res.end(JSON.stringify(resp)));
      } else {
        res.end(JSON.stringify({ ok: false }));
      }
    }
  }
};
