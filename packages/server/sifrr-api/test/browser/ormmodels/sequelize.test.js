function getReq(url) {
  return page.evaluate((url) => {
    return Sifrr.Fetch.get(url);
  }, PATH + url);
}

describe('SequelizeModel', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
  });

  it('__ connection works', async () => {
    const data = (await getReq('/api/v1/pets?where={"owner__id":1}')).data;

    assert.equal(data.getPet.length, 2);
  });

  it('multiple __ connection works', async () => {
    const data = (await getReq('/api/v1/pets?where={"owner__pets__id":3}')).data;

    assert.equal(data.getPet.length, 1);
    assert.equal(data.getPet[0].owner.id, 2);
  });
});
