describe('graphql', function () {
  before(async () => {
    await page.goto(`${PATH}/static.html`);
  });

  it('works with query params', async () => {
    const resp = await page.evaluate(async (p) => {
      return await Sifrr.Fetch.post(
        `${p}/graphql?query=query($id: String) { user(id: $id) { id \n name } }&variables={"id":"a"}`
      );
    }, PATH);
    expect(resp).to.deep.equal({
      data: {
        user: {
          id: 'a',
          name: 'alice'
        }
      }
    });
  });

  it('works with body', async () => {
    const resp = await page.evaluate(async (p) => {
      return await Sifrr.Fetch.graphql(`${p}/graphql`, {
        query: `
          query($id: String) {
            user(id: $id) {
              id
              name
            }
          }`,
        variables: {
          id: 'b'
        }
      });
    }, PATH);
    expect(resp).to.deep.equal({
      data: {
        user: {
          id: 'b',
          name: 'bob'
        }
      }
    });
  });

  it('works with both', async () => {
    const resp = await page.evaluate(async (p) => {
      return await Sifrr.Fetch.graphql(`${p}/graphql?variables={"id":"b"}`, {
        query: `
          query($id: String) {
            user(id: $id) {
              id
              name
            }
          }`
      });
    }, PATH);
    expect(resp).to.deep.equal({
      data: {
        user: {
          id: 'b',
          name: 'bob'
        }
      }
    });
  });
});
