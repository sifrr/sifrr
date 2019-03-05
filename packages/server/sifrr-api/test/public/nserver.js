const http = require('http');
const cluster = require('cluster');
const numCPUs = process.env.WORKERS || require('os').cpus().length;

if (cluster.isMaster) {
  process.stdout.write(`Master ${process.pid} is running \n`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('disconnect', (worker) => {
    process.stdout.write(`worker ${worker.process.pid} disconnected \n`);
    cluster.fork();
  });
} else {
  http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.match(/\/.*/)) {
      res.end('Hello World!');
    }
  }).listen(3000, () => process.stdout.write(`listening on 3000, process ${process.pid} \n`));
}
