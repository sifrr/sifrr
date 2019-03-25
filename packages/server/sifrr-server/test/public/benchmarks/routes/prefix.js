const path = require('path');

const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*'
};

module.exports = {
  basePath: '/p',
  folder: {
    '': [path.join(__dirname, '../public'), { headers, lastModified: false }],
  }
};
