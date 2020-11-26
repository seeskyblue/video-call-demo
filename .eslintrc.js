module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:compat/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'prettier/babel',
    'prettier/react',
  ],
  globals: {
    __DEVELOPMENT__: 'readonly',
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'compat', 'react', 'react-hooks', 'jsx-a11y'],
  rules: {
    'no-await-in-loop': 'error',
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'debug', 'group', 'groupEnd', 'groupCollapsed'],
      },
    ],
    'no-shadow': 'error',
    'no-use-before-define': ['error', 'nofunc'],
    'class-methods-use-this': 'error',
    'default-case': 'error',
    'no-eval': 'error',
    'no-magic-numbers': [
      'warn',
      {
        ignore: [-1, 0, 1, 2, 100],
        ignoreArrayIndexes: true,
      },
    ],
    'arrow-body-style': ['error', 'as-needed'],
    'no-duplicate-imports': 'error',
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
      },
    ],
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-destructuring': 'error',
    'prefer-template': 'error',
    'import/first': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
    'import/newline-after-import': 'error',
    'react/destructuring-assignment': [
      'error',
      'always',
      {
        ignoreClassFields: true,
      },
    ],
    'react/forbid-prop-types': [
      'error',
      {
        forbid: ['any', 'array'],
      },
    ],
    'react/no-unused-prop-types': 'error',
    'react/no-unused-state': 'error',
    'react/self-closing-comp': 'error',
    'react/sort-comp': [
      'error',
      {
        order: ['static-methods', 'lifecycle', '/^(on|handle).+$/', 'everything-else', 'rendering'],
        groups: {
          rendering: ['/^render.+$/', 'render'],
        },
      },
    ],
    'react/sort-prop-types': [
      'error',
      {
        ignoreCase: true,
        callbacksLast: true,
        sortShapeProp: true,
      },
    ],
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.tsx'],
      },
    ],
    'jsx-a11y/label-has-for': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['**/*.tsx', '**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:compat/recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:prettier/recommended',
        'prettier/@typescript-eslint',
        'prettier/babel',
        'prettier/react',
      ],
      rules: {
        'react/prop-types': 'off',
        '@typescript-eslint/no-explicit-any': [
          'error',
          {
            ignoreRestArgs: true,
          },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            ignoreRestSiblings: true,
          },
        ],
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'error',
          {
            functions: false,
            ignoreTypeReferences: true,
          },
        ],
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {},
      webpack: {
        config: 'webpack.config.js',
      },
    },
    polyfills: ['Promise'],
    react: {
      version: 'detect',
    },
  },
};
