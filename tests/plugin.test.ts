import { describe, expect, it } from 'vitest';

import { pluginRstDirectives } from '../src/plugin.js';
import { remarkRstDirectives } from '../src/remark.js';

describe('pluginRstDirectives', () => {
  it('registers the remark plugin with Rspress', () => {
    const plugin = pluginRstDirectives();

    expect(plugin.name).toBe('rspress-plugin-rst-directives');
    expect(plugin.markdown?.remarkPlugins).toEqual([
      [remarkRstDirectives, {}],
    ]);
  });

  it('forwards directive options', () => {
    const options = { directives: { listTable: false } };

    expect(pluginRstDirectives(options).markdown?.remarkPlugins).toEqual([
      [remarkRstDirectives, options],
    ]);
  });
});
