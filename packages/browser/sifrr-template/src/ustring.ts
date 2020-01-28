// basic unique string creator
// inspired from https://github.com/sindresorhus/crypto-random-string/blob/master/index.js, but for browser
const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'.split('');
const count = characters.length;

const cssCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'.split('');
const cssCount = cssCharacters.length;

const createUniqueString = (length: number, cssSafe = false) => {
  let string = '';
  let stringLength = 0;

  const cnt = cssSafe ? cssCount : count;
  const chars = cssSafe ? cssCharacters : characters;

  while (stringLength < length) {
    const randomCharPosition = Math.ceil(
      (crypto.getRandomValues(new Uint8Array(1))[0] / 255) * (cnt - 1)
    );

    string += chars[randomCharPosition];
    stringLength++;
  }

  return string;
};

export default createUniqueString;
