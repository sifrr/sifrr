const GraphqlExecutor = require('../../src/api/graphqlexecutor');
const schema = require('./utils/schema');

const executer = new GraphqlExecutor(schema);

describe('GraphqlExecutor', () => {
  it('executes given graphql', async () => {
    const data = await executer.resolve(
      `query user($id: String!) {
      user(id: $id) {
        id
        name
      }
    }`,
      { id: 'a' }
    );
    assert.equal(data.data.user.id, 'a');
  });
});
