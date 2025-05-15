// basic unique string creator
const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'.split('');
const count = characters.length;

const createUniqueString = (length: number) => {
  let string = '';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);

  arr.forEach((value) => {
    const randomCharPosition = Math.ceil((value / 255) * (count - 1));
    string += characters[randomCharPosition];
  });

  return string;
};

export default createUniqueString;
