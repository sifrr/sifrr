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

  addObject(object) {
    if (!(object instanceof ObjectType)) {
      throw Error('Object must be an instance of ObjectType: ' + JSON.stringify(object));
    }
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
      object.convertInterfaces && object.convertInterfaces();
      object.interfaces && object.interfaces.forEach(i => this.addObject(i));
      object.fields &&
        object.fields.forEach(f => {
          if (f && f.type instanceof ObjectType) this.addObject(f.type);
          if (f && f.type && f.type[0] instanceof ObjectType) this.addObject(f.type[0]);
        });
    });

    return [...newObjects].map(o => o.getSchema()).join('\n\n');
  }

  static from(obj = []) {
    const unions = new Set();
    const schema = new this();

    obj.forEach(o => {
      if (o instanceof ObjectType) return schema.addObject(o);
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
