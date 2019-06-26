const Json = require('../../../src/utils/json');

describe('Json', () => {
  describe('shallowEqual', () => {
    it('returns true if they are shallowly equal', () => {
      assert(
        Json.shallowEqual(
          {
            a: 'b',
            c: 'd'
          },
          {
            a: 'b',
            c: 'd'
          }
        )
      );
    });

    it('returns false if one key is different', () => {
      assert(
        !Json.shallowEqual(
          {
            a: 'b',
            c: 'd'
          },
          {
            a: 'b',
            c: 'e'
          }
        )
      );
    });

    it('returns false if one key is missing', () => {
      assert(
        !Json.shallowEqual(
          {
            a: 'b',
            c: 'd'
          },
          {
            a: 'b'
          }
        )
      );
    });

    it('returns false if one key is missing', () => {
      assert(
        !Json.shallowEqual(
          {
            a: 'b'
          },
          {
            a: 'b',
            c: 'd'
          }
        )
      );
    });
  });
});
