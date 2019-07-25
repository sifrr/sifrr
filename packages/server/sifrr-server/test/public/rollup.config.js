import path from 'path';
import { getRollupConfig } from '@sifrr/dev';

export default getRollupConfig(
  {
    name: 'live',
    inputFile: path.join(__dirname, `./livesrc.js`),
    outputFolder: __dirname,
    outputFileName: 'livereload',
    type: 'browser'
  },
  {
    external: []
  },
  false
);
