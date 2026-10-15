import { z } from 'zod';
import { CURSORS, FONTS, PROMPTS, SIZE, THEMES } from '../data/lab';

/** Un diseño del laboratorio: lo que se exporta y lo que se comparte. */
export interface Design {
  theme: keyof typeof THEMES;
  font: keyof typeof FONTS;
  prompt: keyof typeof PROMPTS;
  cursor: keyof typeof CURSORS;
  size: number;
}

export const DEFAULT_DESIGN: Design = { theme: 'gruvbox', font: 'jetbrains', prompt: 'h4ck3r', cursor: 'beam', size: 13 };

const SOURCES = { theme: THEMES, font: FONTS, prompt: PROMPTS, cursor: CURSORS };

const isKey = <T extends object>(src: T, k: unknown): k is keyof T => typeof k === 'string' && Object.hasOwn(src, k);

const keysOf = <T extends object>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

/**
 * Validación estricta para la API: a diferencia de `normalizeDesign`, rechaza
 * cualquier valor desconocido en lugar de sustituirlo.
 */
export const designSchema = z.strictObject({
  theme: z.enum(keysOf(THEMES)),
  font: z.enum(keysOf(FONTS)),
  prompt: z.enum(keysOf(PROMPTS)),
  cursor: z.enum(keysOf(CURSORS)),
  size: z.number().int().min(SIZE.min).max(SIZE.max),
}) satisfies z.ZodType<Design>;

/**
 * Construye un diseño válido a partir de datos sin validar (query params, JSON…).
 * Los valores desconocidos se sustituyen por los de `DEFAULT_DESIGN`.
 */
export function normalizeDesign(input: Partial<Record<keyof Design, unknown>>): Design {
  const d = { ...DEFAULT_DESIGN };
  if (isKey(SOURCES.theme, input.theme)) d.theme = input.theme;
  if (isKey(SOURCES.font, input.font)) d.font = input.font;
  if (isKey(SOURCES.prompt, input.prompt)) d.prompt = input.prompt;
  if (isKey(SOURCES.cursor, input.cursor)) d.cursor = input.cursor;
  const size = Number(input.size);
  if (Number.isInteger(size) && size >= SIZE.min && size <= SIZE.max) d.size = size;
  return d;
}

export const designFromParams = (q: URLSearchParams) =>
  normalizeDesign(Object.fromEntries((['theme', 'font', 'prompt', 'cursor', 'size'] as const).map(k => [k, q.get(k)])));

export const designToParams = (d: Design) =>
  new URLSearchParams({ theme: d.theme, font: d.font, prompt: d.prompt, cursor: d.cursor, size: String(d.size) });

/** "Gruvbox Dark · JetBrains Mono · 13px" */
export const designLabel = (d: Design) => `${THEMES[d.theme].name} · ${FONTS[d.font].name} · ${d.size}px`;
