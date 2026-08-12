import type { RspressPlugin } from '@rspress/core';

import { remarkRstDirectives } from './remark.js';
import type { RstDirectivesOptions } from './types.js';

export function pluginRstDirectives(
  options: RstDirectivesOptions = {},
): RspressPlugin {
  return {
    name: 'rspress-plugin-rst-directives',
    markdown: {
      remarkPlugins: [[remarkRstDirectives, options]],
    },
  };
}
