import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from 'astro:env/server';
import { createDb } from './connect';

export type { Db } from './connect';

/** Conexión de la app, configurada con las variables de entorno. */
export const db = createDb(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);
