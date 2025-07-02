const fs = require('fs');

const getPackages = () => {
  const folders = fs
    .readdirSync('./packages', { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .flatMap((dir) =>
      fs
        .readdirSync('./packages/' + dir.name, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => dir.name)
    );

  return folders;
};

const Configuration = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject']
    }
  },
  rules: {
    'scope-enum': [2, 'always', getPackages()],
    'type-enum': [
      2,
      'always',
      [
        'fix',
        'feat',
        'chore',
        'refactor',
        'test',
        'revert',
        // only to be used by release PRs
        'release'
      ]
    ]
  },
  plugins: []
};

module.exports = Configuration;
