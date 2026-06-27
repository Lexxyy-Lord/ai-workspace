import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/', 'data/', 'coverage/'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': ['warn', { allow: ['error'] }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];
