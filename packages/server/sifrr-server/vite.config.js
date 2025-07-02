import viteConfig from '@sifrr/vite-config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default viteConfig(
  __dirname,
  [
    'uWebSockets.js',
    'graphql',
    'node:cluster',
    'node:os',
    'fs',
    'zlib',
    'path',
    'stream',
    'stream/consumers',
    'events',
    'busboy',
    'query-string',
    'mkdirp',
    'uuid',
    'iterall'
  ],
  false
);
