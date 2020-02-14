import path from 'path';
import program from 'yargs';
// commands
import ConfigGenerate from './commands/configgenerate';
import ElementGenerate from './commands/elementgenerate';
import { CONFIG_FILE_NAME } from './constants';
import { defaultConfig } from './templates/config';

// config
const configPath = path.resolve(CONFIG_FILE_NAME);
let sifrrConfig = defaultConfig();
try {
  sifrrConfig = Object.assign(sifrrConfig, require(configPath));
} catch (error) {
  console.error(
    'sifrr.config.js not found. Generate config with command `sifrr-cli config:generate` \n'
  );
}

global.ENV = process.env.NODE_ENV || process.env.ENV || 'development';

// CLI
const cli = program
  .scriptName('sifrr-cli')
  .help()
  .version()
  .alias('version', 'v')
  .alias('help', 'h')
  .command(
    'element:generate <name>',
    'create sifrr-dom custom element',
    yargs =>
      yargs
        .positional('name', {
          type: 'string',
          describe: 'Name of sifrr element'
        })
        .option('path', {
          alias: 'p',
          describe: 'base directory for elements',
          type: 'string'
        })
        .option('extends', {
          type: 'string',
          alias: 'e',
          describe: 'extend sifrr element with this class.',
          default: null
        })
        .option('force', {
          type: 'boolean',
          alias: 'f',
          describe: 'force create element.',
          default: false
        }),
    argv => ElementGenerate(argv, sifrrConfig)
  )
  .alias('element:generate', 'element:create')
  .command(
    'config:generate',
    'generate sifrr config file',
    yargs =>
      yargs.option('force', {
        type: 'boolean',
        alias: 'f',
        describe: 'force create config.',
        default: false
      }),
    argv => ConfigGenerate(argv, sifrrConfig)
  )
  .alias('config:generate', 'config:create');

const args = cli.argv;
if (!args._[0]) {
  console.log(`
=====================
     _  __  
 ___(_)/ _|_ __ _ __ 
/ __| | |_| '__| '__|
\\__ \\ |  _| |  | |   
|___/_|_| |_|  |_| 

=====================

`);

  cli.showHelp();
}

export * from './constants';
export * from './types';
export { ElementGenerate, ConfigGenerate };
