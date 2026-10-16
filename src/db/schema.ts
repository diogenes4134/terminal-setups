import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

/** Diseños del laboratorio guardados para compartir con un enlace corto (/s/<id>). */
export const designs = sqliteTable(
  'designs',
  {
    id: text('id').primaryKey(),
    theme: text('theme').notNull(),
    font: text('font').notNull(),
    prompt: text('prompt').notNull(),
    cursor: text('cursor').notNull(),
    size: integer('size').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    views: integer('views').notNull().default(0),
  },
  t => [
    // el mismo diseño siempre recibe el mismo enlace: la tabla no puede crecer más allá
    // del número de combinaciones posibles, así que no hace falta limitar peticiones
    unique('designs_combo').on(t.theme, t.font, t.prompt, t.cursor, t.size),
  ],
);
