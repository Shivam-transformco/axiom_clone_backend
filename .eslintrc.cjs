module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'prettier'],
  env: { node: true, jest: true, es2022: true },
  settings: { 'import/resolver': { typescript: true } },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
