import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Design Token and Theme Classes (TC-001, TC-013, TC-014)', () => {
  it('globals.css defines all required theme token aliases under @theme', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    const requiredTokens = [
      '--color-charcoal: var(--ink-900)',
      '--color-charcoal-muted: var(--ink-500)',
      '--color-sand: var(--sand-100)',
      '--color-sand-50: var(--shell-50)',
      '--color-sand-card: var(--shell-50)',
      '--color-sand-subtle: var(--sand-200)',
      '--color-sand-muted: var(--sand-200)',
      '--color-tide: var(--tide-800)',
      '--color-terracotta: var(--coral-600)',
    ];

    for (const token of requiredTokens) {
      expect(cssContent).toContain(token);
    }
  });

  it('globals.css eliminates self-referential semantic variables', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Should NOT contain self-referencing definitions like var(--color-surface)
    expect(cssContent).not.toContain('--color-surface: var(--color-surface)');
    expect(cssContent).not.toContain('--color-text-base: var(--color-text)');
    expect(cssContent).not.toContain('--color-border-base: var(--color-border)');
  });
});
