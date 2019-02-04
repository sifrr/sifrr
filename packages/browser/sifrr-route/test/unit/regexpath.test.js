const Regex = require('../../src/regexpath');

describe('Regex', () => {
  it('works with :name', () => {
    const reg = new Regex('/abcd/:name/yz');
    const res = reg.test('/abcd/name/yz');
    console.log(res);
    assert(res.match);
    assert.equal(res.data.name, 'name');
  });

  it('works with :name?', () => {
    const reg = new Regex('/abcd/:name?');
    assert(reg.test('/abcd/name').match);
    assert(reg.test('/abcd').match);

    const reg2 = new Regex('/abcd/:name?/some');
    assert(reg2.test('/abcd/name/some').match);
    assert(reg2.test('/abcd/some').match);
  });

  it('works with *', () => {
    const reg = new Regex('/abcd/*/yz');
    const res = reg.test('/abcd/name/yz');
    assert(res.match);
    assert.equal(res.data['*'][0], 'name');
  });

  it('works with **', () => {
    const reg = new Regex('/abcd/**/yz');
    const res = reg.test('/abcd/mnop/qrst/aaa/yz');
    assert(res.match);
    assert.equal(res.data['**'][0], 'mnop/qrst/aaa');
  });

  it('works with custom regex', () => {
    const reg = new Regex('/[a-zA-Z]+/.+');
    expect(reg.test('/abcd/mnop/qrst/aaa/yz').match).to.be.true;
    expect(reg.test('/abcd112/mnop/qrst/aaa/yz').match).to.be.false;

    const reg2 = new Regex('/([a-zA-Z]+)/:name/*/.+');
    const match = reg2.test('/abcd/mnop/qrst/aaa/yz');
    expect(match.data).to.deep.equal({
      '*': ['qrst'],
      name: 'mnop',
      regexGroups: ['abcd']
    });
  });

  it('works with complex example', () => {
    const reg = new Regex('/:x/*/**/mnop/*/:k/[0-9]+');
    const res = reg.test('/new/def/ghi/klm/mnop/sdf/klm/123');
    expect(res.data).to.deep.equal({
      x: 'new',
      k: 'klm',
      '*': [
        'def',
        'sdf'
      ],
      '**': [
        'ghi/klm'
      ],
    });
  });
});
