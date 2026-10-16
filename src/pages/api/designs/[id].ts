import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { getDesign } from '../../../server/designs';
import { json } from '../../../server/http';

export const prerender = false;

/** GET /api/designs/<id> → el diseño, o 404 */
export const GET: APIRoute = async ({ params }) => {
  const design = await getDesign(db, params.id ?? '');
  return design ? json(design) : json({ error: 'No existe' }, 404);
};
