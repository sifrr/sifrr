'use strict';

import path from 'path';
import { getRollupConfig } from '@sifrr/dev';

export default getRollupConfig(
  {
    name: 'sseo',
    inputFile: path.join(__dirname, `./src.js`),
    outputFolder: __dirname,
    outputFileName: 'index',
    type: 'browser'
  },
  {
    external: []
  },
  false
);
