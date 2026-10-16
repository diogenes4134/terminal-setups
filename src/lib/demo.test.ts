import { describe, expect, it } from 'vitest';
import { DEMO_PROMPTS, DEMO_THEMES, demoCommand, demoLines, themeVars } from './demo';

describe('demoLines', () => {
  it('siempre tiene el mismo número de líneas, para que la ventana no salte', () => {
    const counts = new Set<number>();
    for (const p of DEMO_PROMPTS) for (const applied of [false, true]) counts.add(demoLines('nord', p, 'ls', applied).length);
    expect(counts.size).toBe(1);
  });

  it('muestra el cursor mientras escribe y el resultado al aplicar', () => {
    const typing = demoLines('nord', 'pure', 'kitty', false).flat().join('');
    expect(typing).toContain('class="cursor"');
    expect(typing).not.toContain('tema aplicado');
    expect(demoLines('nord', 'pure', 'kitty', true).flat().join('')).toContain('tema aplicado');
  });

  it('escapa lo que se escribe', () => {
    expect(demoLines('nord', 'pure', '<script>', false).flat().join('')).toContain('&lt;script&gt;');
  });
});

it('themeVars define fondo, texto y los 16 colores', () => {
  const vars = themeVars(DEMO_THEMES[0]!);
  expect(vars).toMatch(/--bg:#/);
  expect(vars).toMatch(/--fg:#/);
  expect(vars.match(/--c\d+:/g)).toHaveLength(16);
});

it('demoCommand nombra el tema', () => {
  expect(demoCommand('tokyonight')).toBe('kitty +kitten themes "Tokyo Night"');
});
