const Regex = require('../../src/regexpath');

describe('Check', () => {
  it('works with :name', () => {
    const reg = new Regex('/abcd/:name/yz');
    const res = reg.test('/abcd/name/yz');
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
    assert.equal(res.data.star[0], 'name');
  });

  it('works with **', () => {
    const reg = new Regex('/abcd/**/yz');
    const res = reg.test('/abcd/mnop/qrst/aaa/yz');
    assert(res.match);
    assert.equal(res.data['**'][0], 'mnop/qrst/aaa');
    assert.equal(res.data.doubleStar[0], 'mnop/qrst/aaa');
  });

  it('works with custom regex', () => {
    const reg = new Regex('/[a-zA-Z]+/.+');
    expect(reg.test('/abcd/mnop/qrst/aaa/yz').match).to.be.true;
    expect(reg.test('/abcd112/mnop/qrst/aaa/yz').match).to.be.false;
  });

  it('works with complex example', () => {
    const reg = new Regex('/:x/*/**/mnop/*/:k/[0-9]+');
    const res = reg.test('/new/def/ghi/klm/mnop/sdf/klm/123');
    expect(res.data).to.deep.equal({
      x: 'new',
      k: 'klm',
      star: [
        'def',
        'sdf'
      ],
      '*': [
        'def',
        'sdf'
      ],
      doubleStar: [
        'ghi/klm'
      ],
      '**': [
        'ghi/klm'
      ]
    });
  });
});
