const ArgumentType = require('../../../src/api/types/argumenttype');

describe('Argument type', () => {
  it('works with only name and type', () => {
    expect(new ArgumentType('name', 'Int').getSchema()).to.equal('name: Int');
  });

  it('works with is required', () => {
    expect(new ArgumentType('name', 'Int', { required: true }).getSchema()).to.equal('name: Int!');
  });

  it('works with description', () => {
    expect(new ArgumentType('name', 'Int', { description: 'description' }).getSchema()).to.equal(
      `"""description"""\nname: Int`
    );
  });

  it('works with deprecated', () => {
    expect(new ArgumentType('name', 'Int', { deprecated: 'reason' }).getSchema()).to.equal(
      'name: Int @deprecated(reason: "reason")'
    );
  });

  it('join', () => {
    expect(
      ArgumentType.join([new ArgumentType('one', 'Int'), new ArgumentType('two', 'String')])
    ).to.equal(`one: Int\ntwo: String`);
  });
});
