# sifrr-cli · [![npm version](https://img.shields.io/npm/v/@sifrr/cli.svg)](https://www.npmjs.com/package/@sifrr/cli) [![Doscify](https://img.shields.io/badge/API%20docs-Docsify-red.svg)](https://sifrr.github.io/sifrr/#/./packages/server/sifrr-cli/)

Sifrr Command line interface.

## How to use

Do `npm i @sifrr/cli` or `yarn add @sifrr/cli` or add the package to your `package.json` file.

Run `npm run sifrr [command]` or `node_modules/.bin/sifrr [command]`

```terminal
# sifrr --help
Commands:
  sifrr element:generate <name>        [sifrr-dom] create sifrr element

Options:
  --help, -h     Help
  --version, -v  Current version                                  
```

Run `sifrr [command] --help` to show help for that command.

## Commands

### sifrr element:generate <name>

Generate sifrr-element for given name in `public/elements` folder if no `--path` is given.
