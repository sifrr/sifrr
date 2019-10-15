const BaseType = require('./objects/basetype');
const ObjectType = require('./objects/objecttype');
const UnionType = require('./objects/uniontype');

const toType = obj => {
  return require(`./objects/${obj.type.toLowerCase()}type.js`).from(obj);
};

class SchemaType {
  constructor(objects = []) {
    this.objects = new Set();
    [...objects].forEach(o => this.addObject(o));
  }

  addObject(object, shouldThrow = true) {
    if (!(object instanceof BaseType) && shouldThrow) {
      throw Error('Object must be an instance of BaseType: ' + JSON.stringify(object));
    }
    if (Array.isArray(object)) {
      return this.addObject(object[0], shouldThrow);
    }
    return this.objects.add(object);
  }

  removeObject(object) {
    return this.objects.delete(object);
  }

  getResolvers() {
    const resolvers = {};
    this.objects.forEach(o => {
      if (typeof o.getFieldResolvers === 'function') {
        resolvers[o.name] = o.getFieldResolvers();
      }
    });
    return resolvers;
  }

  getSchema() {
    this.objects.forEach(object => {
      if (!object) return;
      object.types && object.types.forEach(o => this.addObject(o));
      object.edgeType && this.addObject(object.edgeType);
      object.interfaces && object.interfaces.forEach(i => this.addObject(i));
      object.fields &&
        object.fields.forEach(f => {
          this.addObject(f.type, false);
          f.arguments && f.arguments.forEach(a => this.addObject(a.type));
        });
    });

    return [...this.objects]
      .filter(o => !(o instanceof ObjectType) || (o.fields && o.fields.size > 0))
      .map(o => o && o.getSchema())
      .filter(s => s)
      .join('\n\n');
  }

  static from(obj = []) {
    const unions = new Set();
    const schema = new this();

    obj.forEach(o => {
      if (o instanceof BaseType) return schema.addObject(o);
      if (typeof o !== 'object' || o == null) return null;

      if (o.type === 'union') return unions.add(o);
      return schema.addObject(toType(o));
    });

    unions.forEach(u => {
      u.types = u.types.map(t => ObjectType.from(t));
      schema.addObject(UnionType.from(u));
    });

    return schema;
  }
}

module.exports = SchemaType;
