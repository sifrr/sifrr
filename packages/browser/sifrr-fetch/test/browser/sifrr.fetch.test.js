function stubRequest(request) {
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
        body: JSON.stringify({ a: request.postData() || request.method() })
      });
    } else if (request.url().indexOf('graphql') >= 0) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ body: JSON.parse(request.postData()) })
      });
    }
    break;
  default:
    request.continue();
  }
}

async function getResponse(type, url, options, text = false) {
  return page.evaluate((type, url, options, text) => {
    if (typeof Sifrr === 'undefined') return Sifrr;
    const ret = Sifrr.Fetch[type](url, options);
    if (text) return ret.then((resp) => resp.text());
    else return ret.catch((e) => e.message);
  }, type, url, options, text);
}


describe('sifrr-fetch', () => {
  before(async () => {
    await page.setRequestInterception(true);
    page.on('request', stubRequest);
    await page.goto(`${PATH}/`, { waitUntil: 'networkidle0' });
  });

  after(async () => {
    page.off('request', stubRequest);
    await page.setRequestInterception(false);
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

  it('graphqls request', async () => {
    const resp = await getResponse('graphql', '/graphql', { query: 'query { hello }', variables: { var: 'var' } });
    expect(resp.body).to.deep.equal({ query: 'query { hello }', variables: { var: 'var' } });

    // Default empty variables
    const resp2 = await getResponse('graphql', '/graphql', { query: 'query { hello }' });
    expect(resp2.body).to.deep.equal({ query: 'query { hello }', variables: {} });
  });

  it('gets text if content type is not application/json', async () => {
    const resp = await getResponse('get', '/file', {}, true);
    expect(resp).to.deep.equal('abcd');
  });

  it('gets file request', async () => {
    const resp = await getResponse('file', '/file', {}, true);
    expect(resp).to.deep.equal('abcd');

    const resp2 = await getResponse('file', '/file', undefined, true);
    expect(resp2).to.deep.equal('abcd');
  });

  it('throws error if response is not ok', async () => {
    expect(await getResponse('get', '/error')).to.equal('Not Found');
  });

  it('params are passed to fetch request', async () => {
    const resp = await getResponse('get', '/params', { params: { param: 'value' } });
    expect(resp).to.deep.equal({ param: 'value' });
  });

  it('progress works for files', async () => {
    const resp = await page.evaluate(async () => {
      return await new Promise(res => {
        Sifrr.Fetch.get('/image.jpg', {
          onProgress: per => res(per)
        });
      });
    });

    expect(parseInt(resp, 10)).to.be.at.most(100);
  });

  it('progress works for json', async () => {
    const resp2 = await page.evaluate(async () => {
      return await new Promise(res => {
        Sifrr.Fetch.get('/progress.json', {
          onProgress: per => res(per)
        });
      });
    });

    expect(parseInt(resp2, 10)).to.be.at.most(100);
  });

  it('progresses to 100 without content-length', async () => {
    const resp2 = await page.evaluate(async () => {
      return await new Promise(res => {
        Sifrr.Fetch.get('/nocl.json', {
          onProgress: per => res(per)
        });
      });
    });

    expect(parseInt(resp2, 10)).to.equal(100);
  });

  it('progresses to 100 when response not okay', async () => {
    const resp2 = await page.evaluate(async () => {
      return await new Promise(res => {
        Sifrr.Fetch.get('/404', {
          onProgress: per => res(per)
        });
      });
    });

    expect(parseInt(resp2, 10)).to.equal(100);
  });

  it('middlewares work', async () => {
    const resp = await page.evaluate(async () => {
      return await Sifrr.Fetch.post('/test', {
        body: 'post body',
        before: ({ url, options, method }) => {
          options.body = 'hijacked body';
          return { url, options, method };
        },
        use: () => ({ a: 'hijack part 2' }),
        after: (resp) => {
          resp.b = 'hijack part 3';
          return resp;
        }
      });
    });
    expect(resp).to.deep.equal({ a: 'hijack part 2', b: 'hijack part 3' });

    const resp2 = await page.evaluate(async () => {
      return await Sifrr.Fetch.post('/test', {
        body: 'post body',
        before: ({ url, options, method }) => {
          options.body = 'hijacked body';
          return { url, options, method };
        },
        use: () => {
          throw Error('bang');
        },
        after: (resp) => {
          resp.b = 'hijack part 3';
          return resp;
        }
      });
    });
    expect(resp2).to.deep.equal({ a: 'hijacked body', b: 'hijack part 3' });
  });
});
