import { defineConfig } from 'vite';
import { resolve, relative } from 'path';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { globSync } from 'glob';
import { readFileSync } from 'fs';

export default (baseDir, external = []) => {
  const entries = Object.fromEntries(
    globSync(resolve(baseDir, 'src') + '/**/index.ts').map((file) => [
      relative(resolve(baseDir, 'src'), file)
        .replace(/index\.ts$/, '')
        .replace(/\/$/, '') || 'index',
      resolve(baseDir, file)
    ])
  );

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
      lib: {
        formats: ['es'],
        entry: {
          ...entries,
          index: resolve(baseDir, 'src/index.ts')
        },
        name: readFileSync(baseDir + '/package.json', 'utf-8').name
      },
      rollupOptions: {
        external,
        output: {
          preserveModules: false,
          // Put chunk files at <output>/chunks
          chunkFileNames: 'chunks/[name].[hash].js',
          // Put chunk styles at <output>/assets
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: '[name].js'
        }
      }
    }
  });
};
