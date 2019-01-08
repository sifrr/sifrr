const elemTemplate = require('../templates/element');
const fs = require('fs');
const mkdirp = require('mkdirp');

module.exports = (argv) => {
  // Element class
  const elemName = argv._[1];
  // Loader
  const elemPath = path.resolve(argv.path, `./${elemName.split('-').join('/')}.html`);
  const className = elemName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/^([a-z])/, (g) => g[0].toUpperCase());
  const extend = argv.extends ? `(${argv.extends})` : '';

  const elemHtml = elemTemplate(className, extend);

  mkdirp.sync(path.dirname(elemPath), (err) => {
    if (err) throw err;
  });

  if (fs.existsSync(elemPath)) {
    global.console.error(`Element file already exists at ${elemPath}`);
    process.exit(1);
  }

  fs.writeFile(elemPath, elemHtml, err => {
    if(err) throw err;
    global.console.log(`File for ${elemName} was saved at '${elemPath}'!`);
  });
};
