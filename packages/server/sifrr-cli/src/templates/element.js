module.exports = (name, ext) => {
  return `import SifrrDom from '@sifrr/dom';

class ${name} extends SifrrDom.Element${ext ? `.extends(${ext})` : ''} {
  static get template() {
    return \`<!-- HTML -->\`;
  }

  onConnect() {

  }

  onDisconnect() {

  }
}
${name}.defaultState = {};
SifrrDom.register(${name}${ext ? ", { extends: '/* tag of html to extend, eg. tr */' }" : ''});

export default ${name};
`;
};
