const http = require('http');
const cluster = require('cluster');
const numCPUs = process.env.WORKERS || require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('disconnect', (worker) => {
    console.error(`worker ${worker.process.pid} disconnected`);
    cluster.fork();
  });
} else {
  http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.match(/\/.*/)) {
      res.end('Hello World!');
    }
  }).listen(3000, (p) => console.log('listening on', 3000, 'process', process.pid));
}
