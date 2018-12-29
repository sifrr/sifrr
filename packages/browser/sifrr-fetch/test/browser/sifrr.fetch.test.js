function stubRequests() {
  page.on('request', request => {
    switch (request.method()) {
    case 'GET':
      if (request.url().indexOf('file') >= 0) {
        request.respond({
          status: 200,
          contentType: 'text/plain',
          body: 'abcd'
        });
      } else if (request.url().indexOf('test') >= 0) {
        request.respond({
          status: 200,
          contentType: 'bang,application/json',
          body: '{"a": "GET"}'
        });
      } else if (request.url().indexOf('error') >= 0) {
        request.respond({ status: 404 });
      } else {
        request.continue();
      }
      break;
    case 'PUT':
    case 'POST':
    case 'DELETE':
      if (request.url().indexOf('test') >= 0) {
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: `{"a": "${request.method()}"}`
        });
      }
      break;
    default:
      request.continue();
    }
  });
}

async function getResponse(type, url, text = false) {
  return await page.evaluate(async (type, url, text) => {
    const ret = Sifrr.Fetch[type](url);
    if (text) return ret.then((resp) => resp.text());
    else return ret.catch((e) => e.message);
  }, type, url, text);
}


describe('sifrr-fetch', () => {
  before(async () => {
    await loadBrowser();
    await page.setRequestInterception(true);
    stubRequests();
    await page.goto(`${PATH}/`);
  });

  after(async () => {
    await browser.close();
  });

  it('gets request', async () => {
    const resp = await getResponse('get', '/test');
    expect(resp).to.deep.equal({ a: 'GET' });
  });

  it('puts request', async () => {
    const resp = await getResponse('put', '/test');
    expect(resp).to.deep.equal({ a: 'PUT' });
  });

  it('posts request', async () => {
    const resp = await getResponse('post', '/test');
    expect(resp).to.deep.equal({ a: 'POST' });
  });

  it('deletes request', async () => {
    const resp = await getResponse('delete', '/test');
    expect(resp).to.deep.equal({ a: 'DELETE' });
  });

  it('gets text if content type is not application/json', async () => {
    const resp = await getResponse('get', '/file', true);
    expect(resp).to.deep.equal('abcd');
  });

  it('gets file request', async () => {
    const resp = await getResponse('file', '/file', true);
    expect(resp).to.deep.equal('abcd');
  });

  it('throws error if response is not ok', async () => {
    expect(await getResponse('get', '/error')).to.equal('Not Found');
  });
});

