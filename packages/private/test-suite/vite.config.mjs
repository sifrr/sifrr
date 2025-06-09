import viteConfig from '@sifrr/vite-config';

const __dirname = import.meta.dirname;
export default viteConfig(__dirname, ['@playwright/test', 'ts-jest'], false);
