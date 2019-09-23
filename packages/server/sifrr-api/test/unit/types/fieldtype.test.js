const ArgumentType = require('../../../src/api/graphql/types/argumenttype');
const FieldType = require('../../../src/api/graphql/types/fieldtype');

describe('Field type', () => {
  const arg = new ArgumentType('one', 'Int');
  const arg2 = new ArgumentType('two', 'String');
  const arg3 = new ArgumentType('three', 'Int');
  const arg4 = new ArgumentType('four', 'Id');

  it('works with unique args', () => {
    const args = [arg, arg2, arg, null, {}, []];
    expect(new FieldType('name', 'Int', { args }).getSchema()).to.equal(
      `name(one: Int, two: String): Int`
    );
  });

  it('adds/removes arg', () => {
    const field = new FieldType('name', 'Int', { args: [arg, arg2] });
    field.addArgument(arg3);
    expect(field.getSchema()).to.equal(`name(one: Int, two: String, three: Int): Int`);
    field.removeArgument(arg);
    expect(field.getSchema()).to.equal(`name(two: String, three: Int): Int`);
  });

  it('add new line in args if > 3', () => {
    const field = new FieldType('name', 'Int', { args: [arg, arg2, arg3, arg4] });
    expect(field.getSchema()).to.equal(`name(
  one: Int
  two: String
  three: Int
  four: Id
): Int`);
  });

  it('add new line in args if it has description', () => {
    const field = new FieldType('name', 'Int', {
      args: [new ArgumentType('ok', 'Boolean', { description: 'oh man' })]
    });
    expect(field.getSchema()).to.equal(`name(
  """
  oh man
  """
  ok: Boolean
): Int`);
  });

  it('throws when adding not ArgumentType', () => {
    const field = new FieldType('name', 'Int');
    expect(() => field.addArgument({})).to.throw();
  });
});
