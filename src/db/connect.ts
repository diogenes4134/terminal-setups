import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/** Crea una conexión. Separado de client.ts para que los tests no dependan de astro:env. */
export const createDb = (url: string, authToken?: string) => drizzle(createClient({ url, authToken }), { schema });
export type Db = ReturnType<typeof createDb>;
