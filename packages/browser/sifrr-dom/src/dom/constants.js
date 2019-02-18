const temp = window.document.createElement('template');
const script = window.document.createElement('script');
const reg = '(?:[^{}$]|{(?:[^{}$])*})*';
// const regex = '\\${(' + reg + ')}';
// const sfn = window.document.createElement('sifrr-node');

module.exports = {
  TEMPLATE: () => temp.cloneNode(false),
  SCRIPT: () => script.cloneNode(false),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1,
  OUTER_REGEX: new RegExp('(\\${(?:' + reg + ')})', 'g'),
  // SINGLE_REGEX: new RegExp(`^${regex}$`),
  // GLOBAL_REGEX: new RegExp(regex, 'g')
};
