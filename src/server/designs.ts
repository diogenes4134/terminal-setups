import { and, eq, sql } from 'drizzle-orm';
import type { Db } from '../db/client';
import { designs } from '../db/schema';
import type { Design } from '../lib/design';
import { ID_PATTERN, newId } from '../lib/ids';

/* Lógica de datos de los diseños. Recibe la conexión como parámetro para que
   los tests puedan usar una base de datos en memoria. */

const sameCombo = (d: Design) => and(
  eq(designs.theme, d.theme), eq(designs.font, d.font), eq(designs.prompt, d.prompt),
  eq(designs.cursor, d.cursor), eq(designs.size, d.size),
);

async function findId(db: Db, d: Design) {
  const [row] = await db.select({ id: designs.id }).from(designs).where(sameCombo(d)).limit(1);
  return row?.id;
}

/**
 * Guarda un diseño (ya validado) y devuelve su id. Si la combinación ya existía,
 * devuelve el id de siempre con `created: false`.
 */
export async function saveDesign(db: Db, d: Design): Promise<{ id: string; created: boolean }> {
  const existing = await findId(db, d);
  if (existing) return { id: existing, created: false };

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = newId();
    const inserted = await db.insert(designs).values({ id, ...d }).onConflictDoNothing().returning({ id: designs.id });
    if (inserted.length) return { id, created: true };
    // conflicto: o alguien guardó el mismo diseño a la vez (lo devolvemos) o el id ya existía (reintentamos)
    const raced = await findId(db, d);
    if (raced) return { id: raced, created: false };
  }
  throw new Error('No se pudo generar un id único');
}

/** Devuelve el diseño de un id, o null. Con `countView` suma una visita. */
export async function getDesign(db: Db, id: string, { countView = false } = {}): Promise<Design | null> {
  if (!ID_PATTERN.test(id)) return null;
  const [row] = countView
    ? await db.update(designs).set({ views: sql`${designs.views} + 1` }).where(eq(designs.id, id)).returning()
    : await db.select().from(designs).where(eq(designs.id, id));
  if (!row) return null;
  const { theme, font, prompt, cursor, size } = row;
  return { theme, font, prompt, cursor, size } as Design;
}
