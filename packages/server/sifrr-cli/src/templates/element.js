module.exports = (name, ext) => {
  return `window.Sifrr = window.Sifrr || {};
window.Sifrr.Dom = window.Sifrr.Dom || require('@sifrr/dom');
const Sifrr = window.Sifrr;

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
