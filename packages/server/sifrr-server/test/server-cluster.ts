import { launchCluster, SifrrServer } from '@/index';

const app = new SifrrServer().get('/*', (res) => {
  res.json({
    banging: 'yes'
  });
});
const port = 6010;

launchCluster(app, port, {
  onListen: (p) => {
    console.log(`Worker ${process.pid} listening on port ${p}`);
  }
});
