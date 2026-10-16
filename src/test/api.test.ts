import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Db } from '../db/connect';
import { createTestDb } from './db';

// la API usa la conexión de la app (astro:env); en los tests, una base de datos en memoria
const state = vi.hoisted(() => ({ db: undefined as unknown as Db }));
vi.mock('../db/client', () => ({
  get db() {
    return state.db;
  },
}));

const { POST } = await import('../pages/api/designs/index');
const { GET } = await import('../pages/api/designs/[id]');

const nord = { theme: 'nord', font: 'fira', prompt: 'pure', cursor: 'block', size: 15 };

const post = (body: string) =>
  POST({
    request: new Request('http://test.local/api/designs', {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json' },
    }),
    url: new URL('http://test.local/api/designs'),
  } as APIContext);
const get = (id: string) => GET({ params: { id } } as unknown as APIContext);

beforeEach(async () => {
  state.db = await createTestDb();
});

describe('POST /api/designs', () => {
  it('201 con el id y el enlace corto para un diseño nuevo', async () => {
    const res = await post(JSON.stringify(nord));
    expect(res.status).toBe(201);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    const data = await res.json();
    expect(data.url).toBe(`http://test.local/s/${data.id}`);
  });

  it('200 y el mismo id si el diseño ya existía', async () => {
    const first = await (await post(JSON.stringify(nord))).json();
    const res = await post(JSON.stringify(nord));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(first.id);
  });

  it.each([
    ['JSON roto', '{nope'],
    ['cuerpo vacío', ''],
    ['tema inventado', JSON.stringify({ ...nord, theme: 'matrix' })],
    ['campo extra', JSON.stringify({ ...nord, admin: true })],
  ])('400 con %s', async (_, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
  });
});

describe('GET /api/designs/:id', () => {
  it('200 con el diseño guardado', async () => {
    const { id } = await (await post(JSON.stringify(nord))).json();
    const res = await get(id);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(nord);
  });

  it('404 si no existe', async () => {
    expect((await get('zzzzzzz')).status).toBe(404);
  });
});
