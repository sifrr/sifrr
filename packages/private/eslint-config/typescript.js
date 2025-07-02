/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    browser: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2018,
    extraFileExtensions: ['.vue']
  },
  plugins: ['import-x', '@typescript-eslint'],
  extends: [
    'plugin:import-x/recommended',
    'plugin:import-x/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-unused-vars': 'off', //https://github.com/typescript-eslint/typescript-eslint/issues/2619
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        caughtErrors: 'none'
      }
    ],
    '@typescript-eslint/no-for-in-array': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-regexp-exec': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  overrides: [
    {
      files: ['shims-tsx.d.ts'],
      rules: {
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      files: ['*.test.ts', '*.spec.ts', '*.e2e-spec.ts'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-object-type': 'warn'
      }
    },
    {
      files: ['*.e2e-spec.ts'],
      env: {
        jest: false
      }
    }
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import-x/resolver': {
      typescript: {
        project: ['./tsconfig.json']
      }
    }
  }
};
