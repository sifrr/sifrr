const Argument = require('../../../src/api/graphql/types/argument');
const Field = require('../../../src/api/graphql/types/field');

describe('Field type', () => {
  const arg = new Argument('Int');
  const arg2 = new Argument('String');
  const arg3 = new Argument('Int');
  const arg4 = new Argument('Id');

  it('works with unique args', () => {
    expect(new Field('Int', { name: 'name', args: { one: arg, two: arg2 } }).getSchema()).to.equal(
      `name(one: Int, two: String): Int`
    );
  });

  it('adds/removes arg', () => {
    const field = new Field('Int', { name: 'name', args: { one: arg, two: arg2 } });
    field.addArgument('three', arg3);
    expect(field.getSchema()).to.equal(`name(one: Int, two: String, three: Int): Int`);
    field.removeArgument('one');
    expect(field.getSchema()).to.equal(`name(two: String, three: Int): Int`);
  });

  it('add new line in args if > 3', () => {
    const field = new Field('Int', {
      name: 'name',
      args: { one: arg, two: arg2, three: arg3, four: arg4 }
    });
    expect(field.getSchema()).to.equal(`name(
  one: Int
  two: String
  three: Int
  four: Id
): Int`);
  });

  it('add new line in args if it has description', () => {
    const field = new Field('Int', {
      name: 'name',
      args: { ok: new Argument('Boolean', { description: 'oh man' }) }
    });
    expect(field.getSchema()).to.equal(`name(
  """
  oh man
  """
  ok: Boolean
): Int`);
  });

  it('throws when adding not Argument', () => {
    const field = new Field('name', 'Int');
    expect(() => field.addArgument({})).to.throw();
  });
});
