const { App, writeHeaders, createCluster } = require('../../src/sifrr.server');
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

let i = 0;
createCluster({
  apps: [
    {
      app,
      port: 12345
    },
    {
      app: app2,
      ports: [12346, 12347]
    }
  ],
  onListen: () => i++
});

describe('createcluster', () => {
  it('creates cluster', async () => {
    const responses = await page.evaluate(async () => {
      async function get(url) {
        return fetch(url).then(res => res.text());
      }

      return [
        await get(`http://localhost:12345`),
        await get(`http://localhost:12346`),
        await get(`http://localhost:12347`)
      ];
    });

    expect(responses).to.deep.equal(['OK', 'OK2', 'OK2']);
  });

  it('calls onListen', () => {
    assert.equal(i, 3);
  });

  after(() => {
    app.close();
    app2.close();
  });
});
