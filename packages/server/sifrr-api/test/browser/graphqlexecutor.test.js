function getReq(url) {
  return page.evaluate(url => {
    return Sifrr.Fetch.get(url);
  }, PATH + url);
}

describe('GraphqlExecutor', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
  });

  it('executes given graphql', async () => {
    const data = (await getReq('/api/v1/pets')).data;

    assert.equal(data.getPet.length, 3);
  });

  it('executes given graphql with variables', async () => {
    const data = (await getReq('/api/v1/pet/1?where={"id":2}')).data;

    assert.equal(data.getPet.length, 1);
    assert.equal(data.getPet[0].id, 1);

    const pets = (await getReq('/api/v1/pets?where={"id":2}')).data;

    assert.equal(pets.getPet.length, 1);
    assert.equal(pets.getPet[0].id, 2);
  });
});
