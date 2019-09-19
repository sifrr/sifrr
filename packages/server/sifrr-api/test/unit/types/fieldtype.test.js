const ArgumentType = require('../../../src/api/types/argumenttype');
const FieldType = require('../../../src/api/types/fieldtype');

describe('Argument type', () => {
  it('works with unique args', () => {
    const arg = new ArgumentType('one', 'Int');
    const args = [arg, new ArgumentType('two', 'String'), arg, null, {}, []];
    expect(new FieldType('name', 'Int', { args }).getSchema()).to.equal(
      `name(
  one: Int
  two: String
): Int`
    );
  });

  it('adds/removes arg', () => {
    const arg = new ArgumentType('one', 'Int');
    const arg2 = new ArgumentType('two', 'String');
    const arg3 = new ArgumentType('three', 'Int');
    const field = new FieldType('name', 'Int', { args: [arg, arg2] });
    field.addArgument(arg3);
    expect(field.getSchema()).to.equal(`name(
  one: Int
  two: String
  three: Int
): Int`);
    field.removeArgument(arg);
    expect(field.getSchema()).to.equal(`name(
  two: String
  three: Int
): Int`);
  });

  it('throws when adding not ArgumentType', () => {
    const field = new FieldType('name', 'Int');
    expect(() => field.addArgument({})).to.throw();
  });
});
