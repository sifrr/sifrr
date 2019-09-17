const ArgumentType = require('./argumenttype');

class FieldType extends ArgumentType {
  constructor(name, type, { args = [], resolver, ...superOpts } = {}) {
    super(name, type, superOpts);
    this.resolver = resolver;
    this.arguments =
      args instanceof Set ? args : new Set(args.filter(t => t instanceof ArgumentType));
  }

  addArgument(arg) {
    if (!(arg instanceof ArgumentType)) throw Error('Argument must be an instance of ArgumentType');
    return this.arguments.add(arg);
  }

  removeArgument(arg) {
    return this.arguments.delete(arg);
  }

  getSchema() {
    return ArgumentType.prototype.getSchema.call(
      this,
      `(${ArgumentType.join([...this.arguments])})`
    );
  }
}

module.exports = FieldType;
