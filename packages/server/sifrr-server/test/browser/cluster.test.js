const { App, writeHeaders, Cluster } = require('../../src/sifrr.server');

const app = new App();
const app2 = new App();
app.get('/', res => {
  writeHeaders(res, {
    'Access-Control-Allow-Origin': '*'
  });
  res.end('OK');
});
app2.get('/', res => {
  writeHeaders(res, {
    'Access-Control-Allow-Origin': '*'
  });
  res.end('OK2');
});
const cluster = new Cluster([
  {
    app,
    port: 12345
  },
  {
    app: app2,
    ports: [12346, 12347]
  }
]);

describe('createcluster', function() {
  this.timeout(0);

  let i = 0;
  before(async () => {
    cluster.listen(() => {
      i++;
    });

    await page.setCacheEnabled(false);
    await page.evaluate(async () => {
      window.get = async function(url) {
        return fetch(url)
          .then(res => res.text())
          .catch(() => null);
      };
    });
  });

  it('calls onListen', () => {
    assert.equal(i, 3);
  });

  it('creates cluster', async () => {
    const responses = await page.evaluate(async () => {
      return [
        await window.get(`http://localhost:12345`),
        await window.get(`http://localhost:12346`),
        await window.get(`http://localhost:12347`)
      ];
    });

    expect(responses).to.deep.equal(['OK', 'OK2', 'OK2']);
  });

  // it('closes all cluster', async () => {
  //   cluster.closeAll();
  //   await global.delay(10000);
  //   const responses = await page.evaluate(async () => {
  //     return [
  //       await window.get(`http://localhost:12345`),
  //       await window.get(`http://localhost:12346`),
  //       await window.get(`http://localhost:12347`)
  //     ];
  //   });

  //   expect(responses).to.deep.equal([null, null, null]);
  //   cluster.listen();
  // });

  // it('closes given port on close and listens again on listen', async () => {
  //   cluster.close(12345);
  //   await global.delay(10000);
  //   const response = await page.evaluate(async () => {
  //     return await window.get(`http://localhost:12345`);
  //   });
  //   assert.equal(response, null);

  //   cluster.listen();
  //   const response1 = await page.evaluate(async () => {
  //     return await window.get(`http://localhost:12345`);
  //   });
  //   assert.equal(response1, 'OK');
  // });

  after(async () => {
    await page.setCacheEnabled(true);
    cluster.closeAll();
  });
});
