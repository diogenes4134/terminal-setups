import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { designSchema } from '../../../lib/design';
import { saveDesign } from '../../../server/designs';
import { json } from '../../../server/http';

export const prerender = false;

/** POST /api/designs  { theme, font, prompt, cursor, size } → { id, url } */
export const POST: APIRoute = async ({ request, url }) => {
  const body = await request.json().catch(() => undefined);
  const parsed = designSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'Diseño no válido', issues: parsed.error.issues }, 400);

  const { id, created } = await saveDesign(db, parsed.data);
  return json({ id, url: new URL(`/s/${id}`, url).href }, created ? 201 : 200);
};
