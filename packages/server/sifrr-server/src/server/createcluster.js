const noop = () => {};

// apps: [ { app: SifrrServerApp, port/ports: int } ]
function createCluster({ apps = [], onListen = noop } = {}) {
  const finalApps = [];
  for (let i = 0; i < apps.length; i++) {
    const config = apps[i];
    let { app, port, ports } = config;
    if (!Array.isArray(ports) || ports.length === 0) {
      if (typeof port !== 'number') throw Error(`Port should be a number, given ${port}`);
      ports = [port];
    }
    ports.forEach(p => {
      app.listen(p, socket => {
        onListen.call(app, socket, port);
      });
    });
    finalApps.push({
      app,
      ports
    });
  }
  return finalApps;
}

module.exports = createCluster;
