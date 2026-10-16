import { defineConfig } from 'drizzle-kit';

const url = process.env.TURSO_DATABASE_URL;

// en Vercel no hay local.db que valga: sin Turso, mejor que el deploy falle aquí
if (process.env.VERCEL && !url?.startsWith('libsql://')) {
  throw new Error(`Falta TURSO_DATABASE_URL (libsql://…) en el entorno ${process.env.VERCEL_ENV} de Vercel`);
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: url ?? 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
