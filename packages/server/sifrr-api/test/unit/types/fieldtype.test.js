const ArgumentType = require('../../../src/api/types/argumenttype');
const FieldType = require('../../../src/api/types/fieldtype');

describe('Argument type', () => {
  it('works with unique args', () => {
    const arg = new ArgumentType('one', 'Int');
    const args = [arg, new ArgumentType('two', 'String'), arg, null, {}, []];
    expect(new FieldType('name', 'Int', { args }).getSchema()).to.equal(
      'name(one: Int\ntwo: String): Int'
    );
  });
});
