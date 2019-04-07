const temp = window.document.createElement('template');
const script = window.document.createElement('script');
const reg = '(\\${(?:(?:[^{}$]|{(?:[^{}$])*})*)})';

module.exports = {
  TEMPLATE: () => temp.cloneNode(false),
  SCRIPT: () => script.cloneNode(false),
  TREE_WALKER: () => window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1,
  OUTER_REGEX: new RegExp(reg, 'g'),
  STATE_REGEX: /^\$\{this\.state\.([a-zA-Z0-9_$]+)\}$/,
  HTML_ATTR: 'data-sifrr-html',
  REPEAT_ATTR: 'data-sifrr-repeat',
  KEY_ATTR: 'data-sifrr-key'
};
