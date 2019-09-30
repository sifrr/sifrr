const Argument = require('../../../src/api/graphql/types/argument');

describe('Argument type', () => {
  it('works with only name and type', () => {
    expect(new Argument('Int', { name: 'name' }).getSchema()).to.equal('name: Int');
  });

  it('works with defaultValue', () => {
    expect(new Argument('Int', { name: 'name', defaultValue: 'ok' }).getSchema()).to.equal(
      'name: Int = "ok"'
    );
  });

  it('works with nullable', () => {
    expect(new Argument('Int', { name: 'name', nullable: false }).getSchema()).to.equal(
      'name: Int!'
    );
  });

  it('works with description', () => {
    expect(new Argument('Int', { name: 'name', description: 'description' }).getSchema()).to.equal(
      `"""\ndescription\n"""\nname: Int`
    );
  });

  it('works with deprecated', () => {
    expect(new Argument('Int', { name: 'name', deprecated: 'reason' }).getSchema()).to.equal(
      'name: Int @deprecated(reason: "reason")'
    );
  });

  it('join', () => {
    expect(
      Argument.join([new Argument('Int', { name: 'one' }), new Argument('String', { name: 'two' })])
    ).to.equal(`one: Int\ntwo: String`);
  });
});
