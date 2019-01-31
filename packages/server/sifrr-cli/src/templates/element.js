module.exports = (name, ext) => {
  return `const Sifrr = window.Sifrr || {};
Sifrr.Dom = Sifrr.Dom || require('@sifrr/dom');

const template = Sifrr.Dom.template\`<!-- Content -->\`

class ${name} extends Sifrr.Dom.Element${ext ? `.extends(${ext})` : ''} {
  onConnect() {

  }

  onDisconnect() {

  }
}
${name}.defaultState = {};
Sifrr.Dom.register(${name}${ext ? ', { extends: \'/* tag of html to extend, eg. tr */\' }' : ''});
`;
};
