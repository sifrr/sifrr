const temp = window.document.createElement('template');
const sfn = window.document.createElement('sifrr-node');

module.exports = {
  SIFRR_NODE: () => sfn.cloneNode(),
  TEMPLATE: () => temp.cloneNode(),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1
};
