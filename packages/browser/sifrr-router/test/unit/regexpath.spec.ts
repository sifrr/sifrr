import RegexPath from '@/regexpath';

describe('Regex', () => {
  it('works with :name', () => {
    const reg = new RegexPath('/abcd/:name/yz');
    const res = reg.testRoute('/abcd/name/yz');
    expect(res.match).toEqual(true);
    expect(res.data.name).toEqual('name');
  });

  it('works with :name?', () => {
    const reg = new RegexPath('/abcd/:name?');
    expect(reg.testRoute('/abcd/name').match).toEqual(true);
    expect(reg.testRoute('/abcd').match).toEqual(true);
    expect(reg.testRoute('/abcd/nn').data.name).toEqual('nn');
    expect(reg.testRoute('/abcd').data.name).toEqual(undefined);

    const reg2 = new RegexPath('/abcd/:name?/some');
    expect(reg2.testRoute('/abcd/name/some').match).toEqual(true);
    expect(reg2.testRoute('/abcd/nameing/some').data.name).toEqual('nameing');
    expect(reg2.testRoute('/abcd/some').match).toEqual(true);

    const reg3 = new RegexPath('/abcd/:name?/:some');
    expect(reg3.testRoute('/abcd/name/some').match).toEqual(true);
    expect(reg3.testRoute('/abcd/nameing/some').data).toEqual({ name: 'nameing', some: 'some' });
    expect(reg3.testRoute('/abcd/some').data).toEqual({ name: undefined, some: 'some' });
  });

  it('works with *', () => {
    const reg = new RegexPath('/abcd/*/yz');
    const res = reg.testRoute('/abcd/name/yz');
    expect(res.match).toEqual(true);
    expect(res.data['*']?.[0]).toEqual('name');

    expect(!reg.testRoute('/abcd/yz').match).toBe(true);
  });

  it('works with **', () => {
    const reg = new RegexPath('/abcd/**/yz');
    const res = reg.testRoute('/abcd/mnop/qrst/aaa/yz');
    expect(res.match).toBe(true);
    expect(res.data['**']?.[0]).toBe('mnop/qrst/aaa');

    expect(!reg.testRoute('abcd/sdfsdfsf/dsfdf/ab').match).toBe(true);
  });

  it('works with custom regex', () => {
    const reg = new RegexPath('/[a-zA-Z0-9]+/.+');
    expect(reg.testRoute('/abcd/mnop/qrst/aaa/yz').match).toBe(true);
    expect(reg.testRoute('/abcd112/mnop/qrst/aaa/yz').match).toBe(true);

    const reg2 = new RegexPath('/[0-9]+([a-zA-Z]+)(?<named>[0-9]+)/:name/*/.+');
    const match = reg2.testRoute('/1234abcd4567/mnop/qrst/aaa/yz');
    expect(match.data).toEqual({
      '*': ['qrst'],
      name: 'mnop',
      named: '4567',
      regexGroups: ['abcd', '4567']
    });
  });

  it('works with complex example', () => {
    const reg = new RegexPath('/:x/*/**/mnop/*/:k/[0-9]+');
    const res = reg.testRoute('/new/def/ghi/klm/mnop/sdf/klm/123');
    expect(res.data).toEqual({
      x: 'new',
      k: 'klm',
      '*': ['def', 'sdf'],
      '**': ['ghi/klm']
    });
  });
});
