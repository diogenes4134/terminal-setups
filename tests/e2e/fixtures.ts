import { test as base, expect } from '@playwright/test';

/** `test` que además falla si la página lanza algún error de JavaScript. */
export const test = base.extend<{ noPageErrors: void }>({
  noPageErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('pageerror', e => errors.push(e.message));
      await use();
      expect(errors, 'errores de JavaScript en la página').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
