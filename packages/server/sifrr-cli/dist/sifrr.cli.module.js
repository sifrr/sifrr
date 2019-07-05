/*! Sifrr.Cli v0.0.5 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

var element = (name, ext) => {
  return "import SifrrDom from '@sifrr/dom';\n\nclass ".concat(name, " extends SifrrDom.Element").concat(ext ? ".extends(".concat(ext, ")") : '', " {\n  static get template() {\n    return `<!-- HTML -->`;\n  }\n\n  onConnect() {\n\n  }\n\n  onDisconnect() {\n\n  }\n}\n").concat(name, ".defaultState = {};\nSifrrDom.register(").concat(name).concat(ext ? ", { extends: '/* tag of html to extend, eg. tr */' }" : '', ");\n\nexport default ").concat(name, ";\n");
};

var createfile = (elemPath, content, force = false) => {
  mkdirp.sync(path.dirname(elemPath), err => {
    if (err) throw err;
  });

  if (fs.existsSync(elemPath) && !force) {
    process.stderr.write("File already exists at ".concat(elemPath));
    process.exit(1);
    return false;
  }

  fs.writeFileSync(elemPath, content, err => {
    if (err) throw err;
  });
  process.stdout.write("File was saved at '".concat(elemPath, "'!"));
  return true;
};

var elementgenerate = argv => {
  const elemName = argv.name;
  const elemPath = path.resolve(argv.path, "./".concat(elemName.split('-').join('/'), ".js"));
  const className = elemName.replace(/-([a-z])/g, g => g[1].toUpperCase()).replace(/^([a-z])/, g => g[0].toUpperCase());
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
