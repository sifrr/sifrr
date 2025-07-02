const fs = require('fs');
const path = require('path');

const getPackages = () => {
  const folders = fs
    .readdirSync('./packages', { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .flatMap((dir) =>
      fs
        .readdirSync('./packages/' + dir.name, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => path.resolve(`${dir.parentPath}/${dir.name}`))
    );

  return folders;
};

module.exports = {
  getPackages
};
