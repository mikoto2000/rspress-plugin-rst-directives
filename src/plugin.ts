import type { RspressPlugin } from '@rspress/core';
import { fileURLToPath } from 'node:url';

import { remarkRstDirectives } from './remark.js';
import type { RstDirectivesOptions } from './types.js';

export function pluginRstDirectives(
  options: RstDirectivesOptions = {},
): RspressPlugin {
  return {
    name: 'rspress-plugin-rst-directives',
    globalStyles: fileURLToPath(new URL('../styles.css', import.meta.url)),
    markdown: {
      remarkPlugins: [[remarkRstDirectives, options]],
    },
  };
}
