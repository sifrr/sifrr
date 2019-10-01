const temp = window.document.createElement('template');
const script = window.document.createElement('script');
const reg = '(\\${(?:(?:[^{}$]|{(?:[^{}$])*})*)})';

export const TEMPLATE = () => temp.cloneNode(false);
export const SCRIPT = () => script.cloneNode(false);
export const TREE_WALKER = () =>
  window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);

export const TEXT_NODE = 3;
export const COMMENT_NODE = 8;
export const ELEMENT_NODE = 1;
export const OUTER_REGEX = new RegExp(reg, 'g');
export const STATE_REGEX = /^\$\{this\.state\.([a-zA-Z0-9_$]+)\}$/;
export const HTML_ATTR = 'data-sifrr-html';
export const BIND_ATTR = 'data-sifrr-bind';
export const RENDER_IF_PROP = 'renderIf';
