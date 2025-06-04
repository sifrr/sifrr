// basic unique string creator
const safeChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const safeCharCount = safeChars.length;
const characters = [...safeChars, ...'0123456789-_'.split('')];
const count = characters.length;

const createUniqueString = (length: number = 8) => {
  let string = '';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);

  arr.forEach((value, i) => {
    const randomCharPosition = Math.ceil((value / 255) * ((i === 0 ? safeCharCount : count) - 1));
    string += (i === 0 ? safeChars : characters)[randomCharPosition];
  });

  return string;
};

export default createUniqueString;
