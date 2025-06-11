describe('websocket fallback', function () {
  before(async () => {
    await page.goto(`${PATH}/index.html`, { waitUntil: 'networkidle0' });
  });

  it('works with fallback', async () => {
    const message = await page.evaluate(async () => {
      const sock = new Sifrr.Fetch.Socket(`ws://localhost:0909/`, undefined, () => 'hahaha');
      return await sock.send({ ok: true });
    });

    expect(message).to.deep.equal('hahaha');
  });

  it('throws error without fallback', async () => {
    const message = await page.evaluate(async () => {
      const sock = new Sifrr.Fetch.Socket(`ws://localhost:0909/`);
      return await sock
        .send({ ok: true })
        .catch((e) => e.message)
        .then((m) => m);
    });

    expect(message).to.equal('No fallback provided for websocket failure.');
  });
});

let wsserver;
const wsport = 7700;

describe('websockets', function () {
  this.timeout(0);

  before(async () => {
    wsserver = require('../public/wsserver')(wsport);
    await page.goto(`${PATH}/loadtest.html`, { waitUntil: 'networkidle0' });
  });

  after(async () => {
    // How to close uws server?
    require('uWebSockets.js').us_listen_socket_close(wsserver.socket);
  });

  it('connections to ws', async () => {
    const state = await page.evaluate(async (port) => {
      const sock = new Sifrr.Fetch.Socket(`ws://localhost:${port}/`);
      return await sock
        ._openSocket()
        .then((ws) => !!ws)
        .catch(() => false);
    }, wsport);

    assert.equal(state, true);
  });

  it('gets back the data', async () => {
    const message = await page.evaluate(async (port) => {
      const sock = new Sifrr.Fetch.Socket(`ws://localhost:${port}/`);
      return await sock.send({ ok: true });
    }, wsport);

    expect(message.dataYouSent).to.deep.equal({ ok: true });
  });

  it('gets back correct data', async () => {
    const message = await page.evaluate(async (port) => {
      const sock = new Sifrr.Fetch.Socket(`ws://localhost:${port}/`);
      return {
        ok: await sock.send({ ok: true }),
        notok: await sock.send({ ok: false })
      };
    }, wsport);

    expect(message.ok.dataYouSent).to.deep.equal({ ok: true });
    expect(message.notok.dataYouSent).to.deep.equal({ ok: false });
  });

  it('load test', async () => {
    const result = await page.evaluate(async () => {
      return {
        socket: await window.testSocket(100),
        fetch: await window.testFetch(100)
      };
    });

    global.console.table(result);
    expect(result.socket.total).to.equal(result.fetch.total);
    expect(result.socket.size).to.equal(result.fetch.size);
    // no longer the case after moving to sifrr-server (because localhost)
    // expect(result.socket.time).to.be.at.most(result.fetch.time);
  });

  it('queries graphql', async () => {
    const res = await page.evaluate(async () => {
      const sock = new Sifrr.Fetch.Socket(`ws://${location.host}/graphql`);
      return await sock.graphql({
        query: `query($id: String) {
      user(id: $id) {
        id,
        name
      }
    }
    `,
        variables: { id: 'a' }
      });
    });

    expect(res.data).to.deep.equal({ user: { id: 'a', name: 'alice' } });
  });

  it('(un)subscribes subscriptions', async () => {
    const res = await page.evaluate(async () => {
      const sock = new Sifrr.Fetch.Socket(`ws://${location.host}/graphql`);
      const data = [];
      const id = await sock.subscribe(
        {
          query: `subscription {
          user {
            id,
            name
          }
        }
        `
        },
        (d) => data.push(d)
      );
      const get = {
        query: `query($id: String) {
      user(id: $id) {
        id,
        name
      }
    }
    `,
        variables: { id: 'a' }
      };
      await sock.graphql(get);
      await sock.graphql(get);
      await new Promise((res) => setTimeout(res, 100));
      await sock.unsubscribe(id);
      await sock.graphql(get);
      await new Promise((res) => setTimeout(res, 100));
      return data;
    });

    expect(res.length).to.equal(2);
    res.forEach((d) => {
      expect(d).to.deep.equal({ data: { user: { id: 'a', name: 'alice' } } });
    });
  });
});
