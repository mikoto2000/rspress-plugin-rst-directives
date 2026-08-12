import { defineConfig } from '@rspress/core';
import { pluginRstDirectives } from 'rspress-plugin-rst-directives';

export default defineConfig({
  root: 'examples/basic/docs',
  title: 'RST directives fixture',
  plugins: [pluginRstDirectives()],
});
