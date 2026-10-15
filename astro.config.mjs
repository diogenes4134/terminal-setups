import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://terminal-setups.vercel.app',
  integrations: [sitemap()],
});
