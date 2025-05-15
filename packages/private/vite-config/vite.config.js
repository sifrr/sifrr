import { defineConfig } from 'vite';
import { resolve, relative } from 'path';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { globSync } from 'glob';

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
        exclude: [
          'src/**/*.stories.ts',
          'src/**/*.spec.ts',
          'src/**/*.e2e-spec.ts',
          '.storybook/**'
        ]
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
        name: '@paypay/hikari'
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
