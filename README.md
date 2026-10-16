# ~/setups

Configuraciones de terminal reales (kitty, WezTerm, Ghostty, Windows Terminal…) recreadas en HTML y CSS, sin capturas, y un **laboratorio** para diseñar la tuya: eliges tema, fuente, prompt y cursor, ves el resultado en vivo, exportas el `kitty.conf` / `alacritty.toml` / config de Ghostty y lo compartes con un enlace corto.

## Stack

- [Astro](https://astro.build) + TypeScript (estricto). Las páginas se generan en el build; solo la API y los enlaces compartidos (`/s/<id>`) se ejecutan en el servidor.
- [Turso](https://turso.tech) (libSQL) + [Drizzle ORM](https://orm.drizzle.team) para guardar los diseños. En local, un archivo SQLite.
- Desplegado en [Vercel](https://vercel.com).
- Tests con [Vitest](https://vitest.dev) y [Playwright](https://playwright.dev); CI en GitHub Actions.

## Desarrollo

Requiere Node 24 (`.nvmrc`).

```bash
npm install
npm run db:migrate   # crea local.db con las tablas
npm run dev          # http://localhost:4321
```

No hace falta ninguna variable de entorno en local. En producción, `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` (ver `.env.example`).

## Scripts

| Comando               | Qué hace                                                       |
| --------------------- | -------------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                                         |
| `npm run build`       | Build de producción (salida para Vercel en `.vercel/`)         |
| `npm run check`       | Comprobación de tipos (`.astro` y `.ts`)                       |
| `npm run lint`        | ESLint                                                         |
| `npm run format`      | Formatea con Prettier (`format:check` solo comprueba)          |
| `npm test`            | Tests unitarios y de la API (Vitest, base de datos en memoria) |
| `npm run test:e2e`    | Tests en navegador (Playwright, escritorio y móvil)            |
| `npm run db:generate` | Crea una migración tras cambiar `src/db/schema.ts`             |
| `npm run db:migrate`  | Aplica las migraciones                                         |

Un solo test: `npx vitest run src/lib/export.test.ts` o `npx playwright test -g "enlace corto"`.
La primera vez, Playwright necesita el navegador: `npx playwright install chromium`.

## Estructura

```
src/
  data/        contenido: setups, temas, fuentes y prompts del laboratorio
  lib/         funciones puras compartidas por el build, el navegador y el servidor
  components/  componentes Astro de la página
  scripts/     interactividad del navegador (laboratorio, Ctrl K, demo, efectos)
  db/          esquema y conexión de la base de datos
  server/      lógica de la API
  pages/       rutas: /, /s/[id], /api/designs, 404
drizzle/       migraciones SQL
tests/e2e/     tests de Playwright
```

Para añadir una configuración basta con añadir un objeto a `SETUPS` en `src/data/setups.ts`: el índice, los filtros, la paleta de comandos y la navegación se generan a partir de ahí.
