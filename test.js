const fs = require('fs');
const path = require('path');

const dir = path.resolve('./.nyc_output');

function loadDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    fs.statSync(path.join(dir, file)).isDirectory()
      ? loadDir(path.join(dir, file))
      : fileParse(path.join(dir, file));
  });
}

function fileParse(filePath) {
  if (path.extname(filePath) !== '.json') return;
  const fileContents = require(filePath);
  for (let file in fileContents) {
    const branchStats = fileContents[file].b,
      branchMeta = fileContents[file].branchMap;
    if (!branchStats) {
      return;
    }

    Object.keys(branchStats).forEach((branchName) => {
      console.log(branchName);
      console.log(branchMeta[branchName].locations);
    });
  }
}

fileParse(path.resolve('./cov.json'));
