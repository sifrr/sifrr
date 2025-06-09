import { SifrrServer } from '@/server/baseapp';
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';

export function launchCluster(
  app: SifrrServer,
  port: number,
  {
    numberOfWorkers,
    restartOnError,
    onListen
  }: {
    numberOfWorkers?: number;
    restartOnError?: boolean;
    onListen?: (port: number | false) => void;
  } = {}
) {
  numberOfWorkers = numberOfWorkers ?? availableParallelism();
  restartOnError = restartOnError ?? false;
  if (cluster.isPrimary) {
    console.log(`Cluster: Primary process is running on ${process.pid}`);

    // Fork workers.
    for (let i = 0; i < numberOfWorkers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      if (!signal && restartOnError) {
        cluster.fork();
      }
    });
    return cluster;
  } else {
    app.listen(port, onListen);
  }
}
