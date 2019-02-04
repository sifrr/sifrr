const elemTemplate = require('../templates/element');
const createFile = require('../utils/createfile');
const path = require('path');

module.exports = (argv) => {
  // Element class
  const elemName = argv.name;
  // Loader
  const elemPath = path.resolve(argv.path, `./${elemName.split('-').join('/')}.js`);
  const className = elemName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/^([a-z])/, (g) => g[0].toUpperCase());

  const elemHtml = elemTemplate(className, argv.extends);

  createFile(elemPath, elemHtml, argv.force === 'true');
};
