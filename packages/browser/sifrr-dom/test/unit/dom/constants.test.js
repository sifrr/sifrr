const { OUTER_REGEX } = require('../../../src/dom/constants');

describe('Loader', () => {
  it('matches correctly till one level scope', () => {
    const str = 'abcdljf ${ abcd } asdljasdhk';
    expect(str.match(OUTER_REGEX)[0]).to.eq('${ abcd }');

    const str2 = 'abcdljf ${ abcd if () { } else { } } asdljasdhk';
    expect(str2.match(OUTER_REGEX)[0]).to.eq('${ abcd if () { } else { } }');

    const str3 = 'abcdljf ${ abcd if () { } else { } if () {} } asdljasdhk';
    expect(str3.match(OUTER_REGEX)[0]).to.eq('${ abcd if () { } else { } if () {} }');

    const str4 = 'abcdljf ${ abcd if () { }} else { } if () {} } asdljasdhk';
    expect(str4.match(OUTER_REGEX)[0]).to.eq('${ abcd if () { }}');
  });
});
