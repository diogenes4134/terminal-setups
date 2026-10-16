import { migrate } from 'drizzle-orm/libsql/migrator';
import { createDb } from '../db/connect';

/** Base de datos SQLite en memoria con las mismas migraciones que producción. */
export async function createTestDb() {
  const db = createDb(':memory:');
  await migrate(db, { migrationsFolder: 'drizzle' });
  return db;
}
