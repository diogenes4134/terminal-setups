import { expect, test } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('muestra la portada y las nueve configuraciones', async ({ page }) => {
  await expect(page).toHaveTitle('Terminal Setups');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Tu terminal,\s*con estilo propio\./);
  await expect(page.locator('section.setup')).toHaveCount(9);
  await expect(page.locator('#toc li')).toHaveCount(9);
});

test('el filtro de estilo oculta el resto', async ({ page }) => {
  await page
    .locator('#filters')
    .getByRole('button', { name: /Pastel/ })
    .click();
  await expect(page.locator('section.setup:not([hidden])')).toHaveCount(2);
  await expect(page.locator('#count')).toHaveText('02 / 09');
  await page.locator('#filters').getByRole('button', { name: /Todos/ }).click();
  await expect(page.locator('section.setup:not([hidden])')).toHaveCount(9);
});

test('Ctrl K busca y aplica un tema en el laboratorio', async ({ page }) => {
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Paleta de comandos' })).toBeVisible();
  await page.locator('#cmdkInput').fill('nord');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#labTitle')).toHaveText('Nord · JetBrains Mono · 13px');
});

test('la terminal de la portada cambia al elegir un tema', async ({ page }) => {
  await page.locator('#demoThemes button[data-theme="dracula"]').click();
  await expect(page.locator('#demoTitle')).toHaveText('Dracula — zsh');
  await expect(page.locator('#demoThemes button[data-theme="dracula"]')).toHaveAttribute('aria-pressed', 'true');
});

test('el modo CRT se recuerda al recargar', async ({ page }) => {
  await page.locator('#crtBtn').click();
  await expect(page.locator('html')).toHaveClass(/crt/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/crt/);
  await expect(page.locator('#crtBtn')).toHaveAttribute('aria-pressed', 'true');
});
