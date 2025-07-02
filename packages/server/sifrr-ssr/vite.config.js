import viteConfig from '@sifrr/vite-config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default viteConfig(__dirname, ['puppeteer', 'keyv'], false);
