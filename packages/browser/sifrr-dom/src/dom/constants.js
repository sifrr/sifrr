const temp = window.document.createElement('template');
const script = window.document.createElement('script');
// const sfn = window.document.createElement('sifrr-node');

module.exports = {
  TEMPLATE: () => temp.cloneNode(false),
  SCRIPT: () => script.cloneNode(false),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1
};
