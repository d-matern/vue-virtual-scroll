import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import oxlint from 'eslint-plugin-oxlint';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { rules } from 'eslint-plugin-vue';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  oxlint.configs['flat/recommended'],
  skipFormatting,
];
