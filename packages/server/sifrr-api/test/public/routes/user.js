module.exports = {
  // Routes for /api/v1 and /api/v2
  basePath: ['/v1', '/v2'],
  post: {
    '/user': (req, res) => {
      res.json({ user: 1 });
    }
  },
  get: {
    '/users': (req, res) => {
      res.json({ user: 1 });
    },
    '/user/:id': (req, res) => {
      res.json({ user: 1 });
    },
    '/nuser': (req, res) => {
      res.end(JSON.stringify({ pid: process.pid }));
    },
    '/wsuser': res => {
      // To make respose size equal to express
      res
        .writeHeader('Connection', 'keep-alive')
        .writeHeader('Content-Type', 'text/html; charset=utf-8')
        .writeHeader('Date', 'Wed, 23 Jan 2019 08:20:30 GMT')
        .writeHeader('ETag', 'W/"b-Ai2R8hgEarLmHKwesT1qcY913ys"')
        .writeHeader('X-Powered-By', 'uWSserv')
        .end(JSON.stringify({ pid: process.pid }));
    }
  }
};
