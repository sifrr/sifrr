const Argument = require('./argument');
const { indent: indentString, objectToMap } = require('../util');

class Field extends Argument {
  constructor(type, { args = {}, resolver, indent = true, ...superOpts } = {}) {
    super(type, superOpts);
    this.resolver = resolver;
    this.indent = indent;
    this.arguments = objectToMap(args, Argument);
  }

  addArgument(name, arg) {
    if (!(arg instanceof Argument)) arg = Argument.from(arg.type, { name, ...arg });
    return this.arguments.set(name, arg);
  }

  removeArgument(arg) {
    return this.arguments.delete(arg);
  }

  getSchema(args = true) {
    let newLine;
    this.arguments.forEach(a => {
      delete a.args;
      if (a.description || a.deprecated) newLine = '\n';
    });
    if (this.arguments.size > 3) newLine = '\n';

    return Argument.prototype.getSchema.call(
      this,
      this.arguments.size && args
        ? `(${newLine || ''}${indentString(Argument.join(this.arguments, newLine || ', '), 2, {
            indentFirstAndLast: !!newLine
          })}${newLine || ''})`
        : ''
    );
  }
}

module.exports = Field;
