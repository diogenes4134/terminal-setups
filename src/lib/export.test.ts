import { describe, expect, it } from 'vitest';
import { THEMES } from '../data/lab';
import { DEFAULT_DESIGN, type Design } from './design';
import { exportConfig } from './export';

const nord: Design = { theme: 'nord', font: 'victor', prompt: 'pure', cursor: 'beam', size: 15 };

describe('exportConfig', () => {
  it.each(['kitty', 'alacritty', 'ghostty'] as const)('genera %s igual que siempre', fmt => {
    expect(exportConfig(DEFAULT_DESIGN, fmt)).toMatchSnapshot();
  });

  it('kitty incluye fuente, tamaño, cursor y los 16 colores', () => {
    const out = exportConfig(nord, 'kitty');
    expect(out).toContain('font_family      Victor Mono');
    expect(out).toContain('font_size        15');
    expect(out).toContain('cursor_shape     beam');
    for (const [i, hex] of THEMES.nord.ansi.entries()) expect(out).toMatch(new RegExp(`^color${i}\\s+${hex}$`, 'm'));
  });

  it('alacritty separa colores normales y brillantes y usa los nombres de cursor en inglés', () => {
    const out = exportConfig({ ...nord, cursor: 'underline' }, 'alacritty');
    expect(out).toContain('shape = "Underline"');
    expect(out).toContain(`[colors.normal]\nblack = "${THEMES.nord.ansi[0]}"`);
    expect(out).toContain(`[colors.bright]\nblack = "${THEMES.nord.ansi[8]}"`);
  });

  it('ghostty quita la # del fondo y traduce el cursor de barra', () => {
    const out = exportConfig(nord, 'ghostty');
    expect(out).toContain(`background = ${THEMES.nord.bg.slice(1)}`);
    expect(out).toContain('cursor-style = bar');
    expect(out).toContain(`palette = 15=${THEMES.nord.ansi[15]}`);
  });
});
