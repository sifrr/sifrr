function indent(string, indentation = 2, { indentFirstAndLast = true } = {}) {
  const indent = ' '.repeat(indentation);
  string = string.trim();

  const splited = string.split(/\r\n|\r|\n/g);
  const last = splited.pop();
  const start = splited.join('\n' + indent);
  const firstLastIndent = indentFirstAndLast ? indent : '';
  return (splited.length > 0 ? firstLastIndent + start + '\n' : '') + firstLastIndent + last;
}

module.exports = indent;
