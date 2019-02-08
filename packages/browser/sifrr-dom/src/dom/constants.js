const temp = window.document.createElement('template');
const script = window.document.createElement('script');
// const sfn = window.document.createElement('sifrr-node');

module.exports = {
  // SIFRR_NODE: () => sfn.cloneNode(),
  TEMPLATE: () => temp.cloneNode(),
  SCRIPT: () => script.cloneNode(),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1
};
