const temp = window.document.createElement('template');
const script = window.document.createElement('script');
const reg = '(\\${(?:(?:[^{}$]|{(?:[^{}$])*})*)})';

export const TEMPLATE = () => <HTMLTemplateElement>temp.cloneNode(false);
export const SCRIPT = () => <HTMLScriptElement>script.cloneNode(false);
export const TREE_WALKER = () =>
  window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);

export const TEXT_NODE = window.Node.TEXT_NODE;
export const COMMENT_NODE = window.Node.COMMENT_NODE;
export const ELEMENT_NODE = window.Node.ELEMENT_NODE;
export const OUTER_REGEX = new RegExp(reg, 'g');
export const STATE_REGEX = /^\$\{this\.state\.([a-zA-Z0-9_$]+)\}$/;
export const HTML_ATTR = ':sifrr-html';
export const BIND_SELECTOR = '[\\3A sifrr-bind]';
export const BIND_PROP = 'sifrrBind';
export const REPEAT_ATTR = ':sifrr-repeat';
export const RENDER_IF_PROP = 'renderIf';
