import createUniqueString from '@/ustring';

describe('ustring', () => {
  it('should have correct length', () => {
    for (let i = 0; i < 100; i++) {
      createUniqueString(i + 1).length === i + 1;
    }
  });

  it('should have safe first character', () => {
    for (let i = 0; i < 100; i++) {
      expect(/[0-9_-]/.test(createUniqueString(i + 1)[0]!)).toBeFalsy();
      expect(/[a-zA-Z]/.test(createUniqueString(i + 1)[0]!)).toBeTruthy();
    }
  });
});
