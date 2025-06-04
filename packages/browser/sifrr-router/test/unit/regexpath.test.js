import Regex from '../../src/regexpath';

describe('Regex', () => {
  it('works with :name', () => {
    const reg = new Regex('/abcd/:name/yz');
    const res = reg.testRoute('/abcd/name/yz');
    assert(res.match);
    assert.equal(res.data.name, 'name');
  });

  it('works with :name?', () => {
    const reg = new Regex('/abcd/:name?');
    assert(reg.testRoute('/abcd/name').match);
    assert(reg.testRoute('/abcd').match);

    const reg2 = new Regex('/abcd/:name?/some');
    assert(reg2.testRoute('/abcd/name/some').match);
    assert(reg2.testRoute('/abcd/some').match);
  });

  it('works with *', () => {
    const reg = new Regex('/abcd/*/yz');
    const res = reg.testRoute('/abcd/name/yz');
    assert(res.match);
    assert.equal(res.data['*'][0], 'name');

    assert(!reg.testRoute('/abcd/yz').match);
  });

  it('works with **', () => {
    const reg = new Regex('/abcd/**/yz');
    const res = reg.testRoute('/abcd/mnop/qrst/aaa/yz');
    assert(res.match);
    assert.equal(res.data['**'][0], 'mnop/qrst/aaa');

    assert(!reg.testRoute('abcd/sdfsdfsf/dsfdf/ab').match);
  });

  it('works with custom regex', () => {
    const reg = new Regex('/[a-zA-Z]+/.+');
    expect(reg.testRoute('/abcd/mnop/qrst/aaa/yz').match).to.be.true;
    expect(reg.testRoute('/abcd112/mnop/qrst/aaa/yz').match).to.be.false;

    const reg2 = new Regex('/([a-zA-Z]+)/:name/*/.+');
    const match = reg2.testRoute('/abcd/mnop/qrst/aaa/yz');
    expect(match.data).to.deep.equal({
      '*': ['qrst'],
      name: 'mnop',
      regexGroups: ['abcd']
    });
  });

  it('works with complex example', () => {
    const reg = new Regex('/:x/*/**/mnop/*/:k/[0-9]+');
    const res = reg.testRoute('/new/def/ghi/klm/mnop/sdf/klm/123');
    expect(res.data).to.deep.equal({
      x: 'new',
      k: 'klm',
      '*': ['def', 'sdf'],
      '**': ['ghi/klm']
    });
  });
});
