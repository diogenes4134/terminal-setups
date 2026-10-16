import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Db } from '../db/connect';
import type { Design } from '../lib/design';
import * as ids from '../lib/ids';
import { createTestDb } from '../test/db';
import { getDesign, saveDesign } from './designs';

const nord: Design = { theme: 'nord', font: 'fira', prompt: 'pure', cursor: 'block', size: 15 };
const dracula: Design = { ...nord, theme: 'dracula' };

let db: Db;
beforeEach(async () => {
  db = await createTestDb();
  vi.restoreAllMocks();
});

describe('saveDesign', () => {
  it('guarda un diseño nuevo y lo marca como creado', async () => {
    const { id, created } = await saveDesign(db, nord);
    expect(created).toBe(true);
    expect(id).toMatch(ids.ID_PATTERN);
    expect(await getDesign(db, id)).toEqual(nord);
  });

  it('el mismo diseño devuelve siempre el mismo id', async () => {
    const first = await saveDesign(db, nord);
    const second = await saveDesign(db, { ...nord });
    expect(second).toEqual({ id: first.id, created: false });
  });

  it('diseños distintos reciben ids distintos', async () => {
    const a = await saveDesign(db, nord);
    const b = await saveDesign(db, dracula);
    expect(a.id).not.toBe(b.id);
  });

  it('si el id generado ya existe, reintenta con otro', async () => {
    const taken = (await saveDesign(db, nord)).id;
    vi.spyOn(ids, 'newId').mockReturnValueOnce(taken).mockReturnValueOnce('zzzzzzz');
    expect(await saveDesign(db, dracula)).toEqual({ id: 'zzzzzzz', created: true });
  });

  it('se rinde si nunca consigue un id libre', async () => {
    const taken = (await saveDesign(db, nord)).id;
    vi.spyOn(ids, 'newId').mockReturnValue(taken);
    await expect(saveDesign(db, dracula)).rejects.toThrow(/id único/);
  });
});

describe('getDesign', () => {
  it('devuelve null si no existe o el id no tiene el formato correcto', async () => {
    expect(await getDesign(db, 'zzzzzzz')).toBeNull();
    expect(await getDesign(db, "x' OR 1=1 --")).toBeNull();
  });

  it('solo cuenta la visita cuando se pide', async () => {
    const { id } = await saveDesign(db, nord);
    await getDesign(db, id);
    await getDesign(db, id, { countView: true });
    await getDesign(db, id, { countView: true });
    const row = await db.query.designs.findFirst({ where: (d, { eq }) => eq(d.id, id) });
    expect(row?.views).toBe(2);
  });
});
