// basic unique string creator
// inspired from https://github.com/sindresorhus/crypto-random-string/blob/master/index.js, but for browser
const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~'.split('');
const count = characters.length;

const createUniqueString = (length: number) => {
  let string = '';
  let stringLength = 0;

  while (stringLength < length) {
    const randomCharPosition = Math.ceil(
      (crypto.getRandomValues(new Uint8Array(1))[0] / 255) * (count - 1)
    );

    string += characters[randomCharPosition];
    stringLength++;
  }

  return string;
};

export default createUniqueString;
