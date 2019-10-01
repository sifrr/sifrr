const BaseType = require('./types/objects/basetype');

const getStringType = type => {
  if (type instanceof BaseType) {
    return type.name;
  }
  if (Array.isArray(type)) {
    return `[${getStringType(type[0])}]`;
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

const toType = (obj, Type, name) => {
  if (!(obj instanceof Type) && obj.type !== undefined) obj = Type.from(obj);
  obj.name = obj.name || name;
  obj.type = obj.type || Type.type;
  return obj;
};

const objectToMap = (obj, Type) => {
  if (!obj) return new Map();

  if (obj instanceof Map) {
    const newMap = new Map();
    obj.forEach((arg, name) => newMap.set(name, toType(arg, Type, name)));
    return newMap;
  }

  const map = new Map();
  if (Array.isArray(obj) || obj instanceof Set) {
    [...obj].forEach(o => map.set(o.name, toType(o, Type)));
    return map;
  }
  Object.keys(obj).forEach(k => {
    map.set(k, toType(obj[k], Type, k));
  });
  return map;
};

module.exports = {
  toType,
  getStringType,
  indent,
  objectToMap
};
