global.fetch = require('node-fetch');
const { Fetch } = require('../../../../browser/sifrr-fetch');

function getReq(url) {
  return Fetch.get(PATH + url);
}

describe('GraphqlExecutor', () => {
  it('executes given graphql', async () => {
    const data = await getReq('/api/v1/pets');
    assert.equal(data.data.getPet.length, 3);
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
