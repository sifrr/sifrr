const BaseType = require('./types/objects/basetype');

const getType = type => {
  if (Array.isArray(type)) {
    return { type: type[0] instanceof BaseType ? type : [getType(type[0])], nullable: true };
  } else if (typeof type === 'string') {
    if (type.slice('-1') === '!') {
      return {
        type: new BaseType(type.slice(0, type.length - 1)),
        nullable: false
      };
    } else {
      return {
        type: new BaseType(type),
        nullable: true
      };
    }
  } else {
    return { type, nullable: true };
  }
};

const getStringType = type => {
  if (type instanceof BaseType) {
    return type.name;
  }
  if (Array.isArray(type)) {
    return `[${getStringType(type[0])}]`;
  }
  return type || '';
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
  obj.name = obj.name || name;
  obj.type = obj.type || Type.type;
  if (!(obj instanceof Type)) obj = Type.from(obj);
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
    [...obj].forEach(o => {
      const typedObj = toType(o, Type);
      map.set(o.name, typedObj);
    });
    return map;
  }
  Object.keys(obj).forEach(k => {
    map.set(k, toType(obj[k], Type, k));
  });
  return map;
};

module.exports = {
  getType,
  toType,
  getStringType,
  indent,
  objectToMap
};
