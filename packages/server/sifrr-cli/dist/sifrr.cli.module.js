/*! Sifrr.Cli v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import child_process from 'child_process';
import path from 'path';
import fs from 'fs';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
}

const exec = child_process.execSync;
function check(cmnd, err) {
  let isWorking;
  try {
    exec(cmnd, { stdio: 'ignore' });
    isWorking = true;
  } catch(e) {
    isWorking = false;
  }
  if (!isWorking) {
    process.stderr.write(err);
    process.exit(1);
    return false;
  }
  return true;
}
var check_1 = check;

commonjsGlobal.ENV = commonjsGlobal.ENV || process.env.NODE_ENV || process.env.ENV || 'development';
const configFile = commonjsRequire(path.resolve('./.sequelizerc')).config;
const config = commonjsRequire(path.resolve(configFile))[ENV];
var seqconfig = config;

const exec$1 = child_process.execSync;
const seqCMD = 'PATH=$(npm bin):$PATH sequelize';
const supportedCmds = ['reset', 'setup'];
const logs = {
  reset: (dbName) => `Database ${dbName} dropped and recreated.`,
  setup: (dbName) => `Database ${dbName} set up.`
};
var db = (cmd) => {
  return () => {
    if (supportedCmds.indexOf(cmd) < 0) throw Error('This db command not supported. Supported commands: \n', supportedCmds.map(c => `db:${c}`).join('\n'));
    check_1(`${seqCMD} --version`, 'sequelize-cli is required to run this command. Install it by running `npm i sequelize-cli`');
    const config = seqconfig;
    commonjsGlobal.console.log(`Using ${config.dialect} in ${ENV} environment`);
    const db = commonjsRequire(`./db/${config.dialect}.js`);
    db(config, cmd, (err) => {
      if (err) throw err;
      commonjsGlobal.console.log(logs[cmd](config.database));
      process.stdout.write(`Running migrations`);
      exec$1(`${seqCMD} db:migrate`, { stdio: 'inherit' });
      process.stdout.write(`Done`);
      process.exit(0);
    });
  };
};

var element = (name, ext) => {
  return `window.Sifrr = window.Sifrr || {};
window.Sifrr.Dom = window.Sifrr.Dom || require('@sifrr/dom');
const Sifrr = window.Sifrr;

const template = Sifrr.Dom.template\`<!-- Content -->\`

class ${name} extends Sifrr.Dom.Element${ext ? `.extends(${ext})` : ''} {
  onConnect() {

  }

  onDisconnect() {

  }
}
${name}.defaultState = {};
Sifrr.Dom.register(${name}${ext ? ', { extends: \'/* tag of html to extend, eg. tr */\' }' : ''});
`;
};

var _0777 = parseInt('0777', 8);
var mkdirp = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;
function mkdirP (p, opts, f, made) {
    if (typeof opts === 'function') {
        f = opts;
        opts = {};
    }
    else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    var cb = f || function () {};
    p = path.resolve(p);
    xfs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), opts, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, opts, cb, made);
                });
                break;
            default:
                xfs.stat(p, function (er2, stat) {
                    if (er2 || !stat.isDirectory()) cb(er, made);
                    else cb(null, made);
                });
                break;
        }
    });
}
mkdirP.sync = function sync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    if (mode === undefined) {
        mode = _0777 & (~process.umask());
    }
    if (!made) made = null;
    p = path.resolve(p);
    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }
    return made;
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
  db: db,
  elementGenerate: elementgenerate
};
var sifrr_cli_1 = sifrr_cli.db;
var sifrr_cli_2 = sifrr_cli.elementGenerate;

export default sifrr_cli;
export { sifrr_cli_1 as db, sifrr_cli_2 as elementGenerate };
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.cli.module.js.map
