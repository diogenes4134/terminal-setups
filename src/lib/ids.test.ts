import { describe, expect, it } from 'vitest';
import { ID_LENGTH, ID_PATTERN, newId } from './ids';

describe('newId', () => {
  it('tiene la longitud y el alfabeto esperados', () => {
    for (let i = 0; i < 200; i++) {
      const id = newId();
      expect(id).toHaveLength(ID_LENGTH);
      expect(id).toMatch(ID_PATTERN);
    }
  });

  it('no usa caracteres que se confunden (0, O, 1, l, I)', () => {
    const all = Array.from({ length: 2000 }, newId).join('');
    expect(all).not.toMatch(/[0O1lI]/);
  });

  it('no se repite en la práctica', () => {
    const ids = new Set(Array.from({ length: 20000 }, newId));
    expect(ids.size).toBe(20000);
  });
});

describe('ID_PATTERN', () => {
  it.each(['', 'abc', 'abcdefgh', 'ABCDEFG', 'abc-efg', '../etc/'])('rechaza %j', id => {
    expect(ID_PATTERN.test(id)).toBe(false);
  });
});
