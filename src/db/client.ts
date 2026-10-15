import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } from 'astro:env/server';
import * as schema from './schema';

export const createDb = (url: string, authToken?: string) => drizzle(createClient({ url, authToken }), { schema });
export type Db = ReturnType<typeof createDb>;

/** Conexión de la app, configurada con las variables de entorno. */
export const db = createDb(TURSO_DATABASE_URL, TURSO_AUTH_TOKEN);
