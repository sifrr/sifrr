const ObjectType = require('./objects/objecttype');

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
    return [...this.objects].join('\n\n');
  }
}

module.exports = SchemaType;
