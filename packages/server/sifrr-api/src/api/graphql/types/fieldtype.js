const ArgumentType = require('./argumenttype');
const indentString = require('../../indent');

class FieldType extends ArgumentType {
  constructor(name, type, { args = [], resolver, indent = true, ...superOpts } = {}) {
    super(name, type, superOpts);
    this.resolver = resolver;
    this.indent = indent;
    this.arguments = new Set();
    args.forEach(this.addArgument.bind(this));
  }

  addArgument(arg) {
    if (!(arg instanceof ArgumentType)) throw Error('Argument must be an instance of ArgumentType');
    delete arg.args;
    return this.arguments.add(arg);
  }

  removeArgument(arg) {
    return this.arguments.delete(arg);
  }

  getSchema(args = true) {
    let newLine;
    this.arguments.forEach(a => {
      if (a.description || a.deprecated) newLine = '\n';
    });
    if (this.arguments.size > 3) newLine = '\n';

    return ArgumentType.prototype.getSchema.call(
      this,
      this.arguments.size && args > 0
        ? `(${newLine || ''}${indentString(
            ArgumentType.join([...this.arguments], newLine || ', '),
            2,
            { indentFirstAndLast: !!newLine }
          )}${newLine || ''})`
        : ''
    );
  }
}

module.exports = FieldType;
