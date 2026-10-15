import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://terminal-setups.vercel.app',
  // todo es estático salvo las rutas con `export const prerender = false` (API y /s/<id>)
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap({ filter: page => !page.includes('/s/') })],
  env: {
    schema: {
      // en local, un archivo SQLite; en Vercel, la URL libsql:// de Turso
      TURSO_DATABASE_URL: envField.string({ context: 'server', access: 'secret', default: 'file:local.db' }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
