import { defineConfig } from 'vite';
import { resolve, relative } from 'path';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { globSync } from 'glob';
import { readFileSync } from 'fs';

const nameToGlobal = (name) =>
  name
    .replace(/@([a-z])/, (match, letter) => {
      return letter.toUpperCase();
    })
    .replace(/\/([a-z])/, (match, letter) => {
      return '.' + letter.toUpperCase();
    });

export default (baseDir, external = [], isBrowser = true) => {
  const entries = Object.fromEntries(
    globSync(resolve(baseDir, 'src') + '/**/index.ts').map((file) => [
      relative(resolve(baseDir, 'src'), file)
        .replace(/index\.ts$/, '')
        .replace(/\/$/, '') || 'index',
      resolve(baseDir, file)
    ])
  );
  const name = nameToGlobal(
    JSON.parse(readFileSync(resolve(baseDir, 'package.json'), 'utf-8')).name
  );

  const formats = isBrowser ? ['es', 'umd', 'iife'] : ['es', 'cjs'];
  const outputs = formats.map((format) => ({
    name,
    format,
    preserveModules: !isBrowser,
    // Put chunk files at <output>/chunks
    chunkFileNames: 'chunks/[name].[hash].js',
    // Put chunk styles at <output>/assets
    assetFileNames: 'assets/[name][extname]',
    entryFileNames: `[name]${format === 'cjs' || format === 'es' ? '' : '.[format]'}.${format === 'cjs' ? 'cjs' : format === 'es' ? 'mjs' : 'js'}`,
    globals: external.reduce((prev, cur) => {
      if (cur.startsWith('@sifrr')) prev[cur] = nameToGlobal(cur);
      return prev;
    }, {})
  }));

  return defineConfig({
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(baseDir, 'src')
        }
      ]
    },
    plugins: [
      libInjectCss(),
      dts({
        tsconfigPath: './tsconfig.json',
        include: ['src/**/*.ts', 'src/**/*.js', 'src/**/*.jsx', 'src/**/*.tsx'],
        exclude: ['src/**/*.stories.ts', '**/*.spec.ts', '**/*.e2e-spec.ts']
      })
    ],
    build: {
      cssCodeSplit: true,
      sourcemap: true,
      target: isBrowser ? 'modules' : 'node16',
      lib: {
        entry: {
          ...entries,
          index: resolve(baseDir, 'src/index.ts')
        },
        name
      },
      rollupOptions: {
        external,
        output: outputs
      }
    }
  });
};
