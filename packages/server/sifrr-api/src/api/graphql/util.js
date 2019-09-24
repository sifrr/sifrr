const BaseType = require('./types/basetype');

const getType = type => {
  if (type instanceof BaseType) {
    return type.name;
  }
  if (Array.isArray(type)) {
    return `[${getType(type[0])}]`;
  }
  return type;
};

const indent = (string, indentation = 2, { indentFirstAndLast = true } = {}) => {
  const indent = ' '.repeat(indentation);
  string = string.trim();

  const splited = string.split(/\r\n|\r|\n/g);
  const last = splited.pop();
  const start = splited.join('\n' + indent);
  const firstLastIndent = indentFirstAndLast ? indent : '';
  return (splited.length > 0 ? firstLastIndent + start + '\n' : '') + firstLastIndent + last;
};

module.exports = {
  getType,
  indent
};
