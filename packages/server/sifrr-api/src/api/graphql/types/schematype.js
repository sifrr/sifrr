const BaseType = require('./basetype');
const ObjectType = require('./objects/objecttype');
const UnionType = require('./objects/uniontype');

class SchemaType extends BaseType {
  constructor(objects = []) {
    super('Schema');
    this.objects = new Set();
    [...objects].forEach(o => this.addObject(o));
  }

  addObject(object) {
    if (!(object instanceof ObjectType)) throw Error('Object must be an instance of ObjectType');
    return this.objects.add(object);
  }

  removeObject(object) {
    return this.objects.delete(object);
  }

  getResolvers() {
    const resolvers = {};
    this.objects.forEach(o => {
      resolvers[o.name] = o.getFieldResolvers();
    });
    return resolvers;
  }

  getSchema() {
    const newObjects = new Set();
    this.objects.forEach(object => {
      newObjects.add(object);
      object.types && object.types.forEach(o => this.addObject(o));
      object.edgeType && this.addObject(object.edgeType);
      object.interfaces.forEach(i => this.addObject(i));
      object.fields.forEach(f => {
        if (f.type instanceof ObjectType) this.addObject(f.type);
        if (f.type && f.type[0] instanceof ObjectType) this.addObject(f.type[0]);
      });
    });

    return [...newObjects].map(o => o.getSchema()).join('\n\n');
  }

  static from(obj = []) {
    const unions = new Set();
    const schema = new this();

    obj.forEach(o => {
      if (o instanceof BaseType) return schema.addObject(o);
      if (typeof o !== 'object' || o == null) return null;

      const type = o.type;
      delete o.type;

      if (type === 'union') return unions.add(o);

      const typeCons = require(`./objects/${type.toLowerCase()}type.js`);
      return schema.addObject(typeCons.from(o));
    });

    unions.forEach(u => {
      u.types = u.types.map(t => ObjectType.from(t));
      schema.addObject(UnionType.from(u));
    });

    return schema;
  }
}

module.exports = SchemaType;
