import { expect, test } from './fixtures';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const readClipboard = (page: import('@playwright/test').Page) => page.evaluate(() => navigator.clipboard.readText());

test('un diseño del laboratorio se comparte con un enlace corto que lo reproduce', async ({ page, browser }) => {
  await page.goto('/#lab');
  for (const [group, value] of [
    ['theme', 'rosepine'],
    ['font', 'plex'],
    ['prompt', 'kali'],
    ['cursor', 'block'],
  ])
    await page.locator(`#labControls .chip[data-group="${group}"][data-value="${value}"]`).click();
  await page.locator('#labSize').fill('17');
  await expect(page.locator('#labTitle')).toHaveText('Rosé Pine · IBM Plex Mono · 17px');

  const share = page.locator('button.copy[data-copy="link"]');
  await share.click();
  await expect(share).toHaveText('Copiado ✓');
  const link = await readClipboard(page);
  expect(link).toMatch(/\/s\/[2-9a-z]{7}$/);

  // otra persona, sin nada guardado, abre el enlace
  const other = await (await browser.newContext()).newPage();
  const res = await other.goto(link);
  expect(res?.status()).toBe(200);
  await expect(other).toHaveTitle('Rosé Pine · IBM Plex Mono · 17px · Terminal Setups');
  await expect(other.locator('#labTitle')).toHaveText('Rosé Pine · IBM Plex Mono · 17px');
  await expect(other.locator('#labTerm')).toHaveAttribute('data-cursor', 'block');
  await expect(other.locator('#labControls .chip[aria-pressed="true"]')).toHaveText([
    'Rosé Pine',
    'IBM Plex Mono',
    'Kali',
    'Bloque',
  ]);
  await other.context().close();
});

test('compartir dos veces el mismo diseño da el mismo enlace', async ({ page }) => {
  await page.goto('/#lab');
  await page.locator('#labControls .chip[data-value="dracula"]').click();
  const share = page.locator('button.copy[data-copy="link"]');
  await share.click();
  await expect(share).toHaveText('Copiado ✓');
  const first = await readClipboard(page);

  await page.reload();
  await page.locator('#labControls .chip[data-value="dracula"]').click();
  await share.click();
  await expect(share).toHaveText('Copiado ✓');
  expect(await readClipboard(page)).toBe(first);
});

test('los botones "Copiar" copian el script de instalación y la configuración', async ({ page }) => {
  await page.goto('/');
  await page.locator('#kali .tabs button[data-tab="install"]').click();
  await page.locator('#kali button.copy').click();
  await expect(page.locator('#kali button.copy')).toHaveText('Copiado ✓');
  expect(await readClipboard(page)).toContain('sudo apt install');

  await page.locator('#exportTabs button[data-fmt="ghostty"]').click();
  await page.locator('button.copy[data-copy="lab"]').click();
  expect(await readClipboard(page)).toMatch(/^# ~\/\.config\/ghostty\/config/);
});

test('los enlaces antiguos con query params siguen funcionando', async ({ page }) => {
  await page.goto('/?theme=nord&font=victor&prompt=pure&cursor=underline&size=12#lab');
  await expect(page.locator('#labTitle')).toHaveText('Nord · Victor Mono · 12px');
});

test('un enlace corto que no existe da 404', async ({ page }) => {
  const res = await page.goto('/s/zzzzzzz');
  expect(res?.status()).toBe(404);
  await expect(page.getByText('no such file or directory')).toBeVisible();
});

test('la API rechaza diseños no válidos', async ({ request }) => {
  const res = await request.post('/api/designs', {
    data: { theme: 'matrix', font: 'fira', prompt: 'pure', cursor: 'beam', size: 13 },
  });
  expect(res.status()).toBe(400);
});
