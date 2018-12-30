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
      } else if (request.url().indexOf('param=value') >= 0) {
        request.respond({
          status: 200,
          contentType: 'bang,application/json',
          body: '{"param": "value"}'
        });
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
          body: `{"a": "${request.postData() || request.method()}"}`
        });
      }
      break;
    default:
      request.continue();
    }
  });
}

async function getResponse(type, url, options, text = false) {
  return await page.evaluate(async (type, url, options, text) => {
    const ret = Sifrr.Fetch[type](url, options);
    if (text) return ret.then((resp) => resp.text());
    else return ret.catch((e) => e.message);
  }, type, url, options, text);
}


describe('sifrr-fetch', () => {
  before(async () => {
    await loadBrowser();
    await page.setRequestInterception(true);
    stubRequests();
    await page.coverage.startJSCoverage();
    await page.goto(`${PATH}/`);
  });

  after(async () => {
    const jsCoverage = await page.coverage.stopJSCoverage();
    pti.write(jsCoverage);
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

  it('posts request and post body', async () => {
    const resp = await getResponse('post', '/test', { body: 'post body' });
    expect(resp).to.deep.equal({ a: 'post body' });
  });

  it('deletes request', async () => {
    const resp = await getResponse('delete', '/test');
    expect(resp).to.deep.equal({ a: 'DELETE' });
  });

  it('gets text if content type is not application/json', async () => {
    const resp = await getResponse('get', '/file', {}, true);
    expect(resp).to.deep.equal('abcd');
  });

  it('gets file request', async () => {
    const resp = await getResponse('file', '/file', {}, true);
    expect(resp).to.deep.equal('abcd');
  });

  it('throws error if response is not ok', async () => {
    expect(await getResponse('get', '/error')).to.equal('Not Found');
  });

  it('params are passed to fetch request', async () => {
    const resp = await getResponse('get', '/params', { params: { param: 'value' } });
    expect(resp).to.deep.equal({ param: 'value' });
  });
});

