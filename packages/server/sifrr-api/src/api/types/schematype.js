const ObjectType = require('./objects/objecttype');
const UnionType = require('./objects/uniontype');

class SchemaType {
  constructor(objects = []) {
    this.objects = new Set([...objects].filter(o => o instanceof ObjectType));
  }

  addObject(object) {
    if (!(object instanceof ObjectType)) throw Error('Object must an instance of ObjectType');

    return this.objects.add(object);
  }

  removeObject(object) {
    return this.objects.delete(object);
  }

  getSchema() {
    return [...this.objects].map(o => o.getSchema()).join('\n\n');
  }

  static from(obj = []) {
    const unions = new Set();
    const all = new this(
      obj.map(o => {
        const type = o.type;
        delete o.type;

        if (type === 'union') return unions.add(o);
        const typeCons = require(`./objects/${type.toLowerCase()}type.js`);
        return typeCons.from(o);
      })
    );

    unions.forEach(u => all.addObject(UnionType.from(u)));

    return all;
  }
}

module.exports = SchemaType;
