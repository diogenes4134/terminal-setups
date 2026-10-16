import { describe, expect, it } from 'vitest';
import { fuzzy } from './fuzzy';

describe('fuzzy', () => {
  it('sin consulta devuelve la etiqueta escapada', () => {
    expect(fuzzy('<b>', '')).toEqual({ html: '&lt;b&gt;', score: 0 });
  });

  it('ignora mayúsculas y tildes', () => {
    expect(fuzzy('Índice', 'indice')?.score).toBe(0);
    expect(fuzzy('Rosé Pine', 'ROSE')).not.toBeNull();
  });

  it('marca las letras encontradas en orden', () => {
    expect(fuzzy('Nord', 'nd')?.html).toBe('<mark>N</mark>or<mark>d</mark>');
  });

  it('puntúa peor lo que no es una subcadena', () => {
    expect(fuzzy('Tokyo Night', 'tokyo')?.score).toBe(0);
    expect(fuzzy('Tokyo Night', 'tnt')?.score).toBe(1);
  });

  it('devuelve null si las letras no aparecen en orden', () => {
    expect(fuzzy('Nord', 'dn')).toBeNull();
    expect(fuzzy('Nord', 'nordx')).toBeNull();
  });
});
