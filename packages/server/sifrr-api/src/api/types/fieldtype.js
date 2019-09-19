const ArgumentType = require('./argumenttype');
const indentString = require('../indent');

class FieldType extends ArgumentType {
  constructor(name, type, { args = [], resolver, indent = true, ...superOpts } = {}) {
    super(name, type, superOpts);
    this.resolver = resolver;
    this.indent = indent;
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
      this.arguments.size > 0
        ? `(
${indentString(ArgumentType.join([...this.arguments]))}
)`
        : ''
    );
  }
}

module.exports = FieldType;
