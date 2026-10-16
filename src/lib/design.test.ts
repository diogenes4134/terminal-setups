import { describe, expect, it } from 'vitest';
import { DEFAULT_DESIGN, designFromParams, designLabel, designSchema, designToParams, normalizeDesign } from './design';

const valid = { theme: 'dracula', font: 'fira', prompt: 'kali', cursor: 'block', size: 16 };

describe('normalizeDesign (permisiva, para URLs)', () => {
  it('conserva los valores válidos', () => {
    expect(normalizeDesign(valid)).toEqual(valid);
  });

  it('sustituye cada valor desconocido por el de por defecto', () => {
    expect(normalizeDesign({ theme: 'nope', font: 'fira', size: 99 })).toEqual({ ...DEFAULT_DESIGN, font: 'fira' });
  });

  it('no acepta claves heredadas del prototipo', () => {
    expect(normalizeDesign({ theme: 'toString', cursor: '__proto__' })).toEqual(DEFAULT_DESIGN);
  });

  it('solo acepta tamaños enteros dentro del rango', () => {
    expect(normalizeDesign({ size: 12.5 }).size).toBe(DEFAULT_DESIGN.size);
    expect(normalizeDesign({ size: '11' }).size).toBe(11);
    expect(normalizeDesign({ size: 10 }).size).toBe(DEFAULT_DESIGN.size);
  });

  it('ida y vuelta por query params', () => {
    expect(designFromParams(designToParams(valid as never))).toEqual(valid);
  });
});

describe('designSchema (estricta, para la API)', () => {
  it('acepta un diseño válido', () => {
    expect(designSchema.parse(valid)).toEqual(valid);
  });

  it.each([
    ['tema desconocido', { ...valid, theme: 'nope' }],
    ['tamaño fuera de rango', { ...valid, size: 19 }],
    ['tamaño no entero', { ...valid, size: 13.5 }],
    ['tamaño como texto', { ...valid, size: '13' }],
    ['campo extra', { ...valid, admin: true }],
    ['falta un campo', { theme: 'nord', font: 'fira', prompt: 'pure', cursor: 'beam' }],
    ['no es un objeto', 'nord'],
  ])('rechaza: %s', (_, input) => {
    expect(designSchema.safeParse(input).success).toBe(false);
  });
});

it('designLabel resume el diseño', () => {
  expect(designLabel(valid as never)).toBe('Dracula · Fira Code · 16px');
});
