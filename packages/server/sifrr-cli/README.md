# sifrr-cli · [![npm version](https://img.shields.io/npm/v/@sifrr/cli.svg)](https://www.npmjs.com/package/@sifrr/cli)

Sifrr Command line interface.

## How to use

Do `npm i @sifrr/fetch` or `yarn add @sifrr/fetch` or add the package to your `package.json` file.

Run `sifrr [command]` or `node_modules/.bin/sifrr [command]`

```terminal
# sifrr --help
Commands:
  sifrr db:reset                       [sifrr-api] reset database for given node environment (clears database).
  sifrr db:setup                       [sifrr-api] setup database for given node environment (doesn't clear database).
  sifrr element:generate <name>        [sifrr-dom] create sifrr element

Options:
  --help, -h     Help
  --version, -v  Current version                                  
```

Run `sifrr [command] --help` to show help for that command.

## Commands

### sifrr db:reset

Like `rails db:reset`, resets database. Works with sifrr-api.
Resets database for given `NODE_ENV`, default: 'development'.

### sifrr db:setup

Like `rails db:setup`, setup database without clearing it. Works with sifrr-api.
Setups database for given `NODE_ENV`, default: 'development'.

### sifrr element:generate <name>

Generate sifrr-element for given name in `public/elements` folder if no `--path` is given.
