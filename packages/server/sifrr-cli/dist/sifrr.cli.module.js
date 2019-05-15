/*! Sifrr.Cli v0.0.4 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

var element = (name, ext) => {
  return `import SifrrDom from '@sifrr/dom';

class ${name} extends SifrrDom.Element${ext ? `.extends(${ext})` : ''} {
  static get template() {
    return \`<!-- HTML -->\`;
  }

  onConnect() {

  }

  onDisconnect() {

  }
}
${name}.defaultState = {};
SifrrDom.register(${name}${ext ? ', { extends: \'/* tag of html to extend, eg. tr */\' }' : ''});

export default ${name};
`;
};

var createfile = (elemPath, content, force = false) => {
  mkdirp.sync(path.dirname(elemPath), (err) => {
    if (err) throw err;
  });
  if (fs.existsSync(elemPath) && !force) {
    process.stderr.write(`File already exists at ${elemPath}`);
    process.exit(1);
    return false;
  }
  fs.writeFileSync(elemPath, content, err => {
    if(err) throw err;
  });
  process.stdout.write(`File was saved at '${elemPath}'!`);
  return true;
};

var elementgenerate = (argv) => {
  const elemName = argv.name;
  const elemPath = path.resolve(argv.path, `./${elemName.split('-').join('/')}.js`);
  const className = elemName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/^([a-z])/, (g) => g[0].toUpperCase());
  const elemHtml = element(className, argv.extends);
  createfile(elemPath, elemHtml, argv.force === 'true');
};

var sifrr_cli = {
  elementGenerate: elementgenerate
};
var sifrr_cli_1 = sifrr_cli.elementGenerate;

export default sifrr_cli;
export { sifrr_cli_1 as elementGenerate };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.cli.module.js.map
