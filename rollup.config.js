const path = require('path');

const { loadDir } = require('@sifrr/dev');
const allConfigs = [];

loadDir({
  dir: path.resolve('./packages'),
  onFile: (file) => {
    if (file.match(/packages\/[a-z]+\/sifrr-[a-z]+\/rollup\.config\.js/)) {
      Array.prototype.push.apply(allConfigs, require(file));
    }
  },
  deep: 2
});

module.exports = allConfigs;
