import { launchCluster } from '@/index';
import app from './server';

const port = 6010;

launchCluster(app, port, {
  onListen: (p) => {
    console.log(`Worker ${process.pid} listening on port ${p}`);
  }
});
