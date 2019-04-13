function request(type, url) {
  return page.evaluate((url, type) => {
    return Sifrr.Fetch[type](url);
  }, PATH + url, type);
}

describe('SequelizeModel', () => {
  before(async () => {
    await page.goto(`${PATH}/`);
  });

  it('__ connection works', async () => {
    const data = (await request('get', '/api/v1/pets?where={"owner__id":1}')).data;

    assert.equal(data.getPet.length, 2);
  });

  it('multiple __ connection works', async () => {
    const data = (await request('get', '/api/v1/pets?where={"owner__pets__id":3}')).data;

    assert.equal(data.getPet.length, 1);
    assert.equal(data.getPet[0].owner.id, 2);
  });

  it('__ connection works in creating', async () => {
    const data = (await request('post', '/api/v1/petAndOwner?name=Lucy&owner__name=Aadi')).data;

    assert.equal(data.createPetAndOwner.name, 'Lucy');
    assert.equal(data.createPetAndOwner.owner.name, 'Aadi');
  });
});
