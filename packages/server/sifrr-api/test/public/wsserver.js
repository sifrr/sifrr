const uWS = require('uWebSockets.js');
const cluster = require('cluster');
const numCPUs = process.env.WORKERS || require('os').cpus().length - 1;

let error = 0;

if (cluster.isMaster) {
  process.stdout.write(`Master ${process.pid} is running \n`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('disconnect', (worker) => {
    process.stdout.write(`worker ${worker.process.pid} disconnected \n`);
    if (error < 10) {
      error++;
      cluster.fork();
    }
  });
} else {
  uWS.App().any('/*', (res) => {
    // new Promise((resolve) => {
    res.end(`Hello world!`);
    // });
  }).listen(3000, () => process.stdout.write(`listening on 3000, process ${process.pid} \n`));
}
