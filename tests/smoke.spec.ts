import { test, expect } from '../fixtures/test';
import { users } from '../data/users';

test.describe('Smoke', () => {
  test('SMOKE-01 Login exitoso muestra el catálogo @smoke', async ({ page, loginPage, inventoryPage, check }) => {
    await loginPage.goto();
    await loginPage.login(users.standard);

    await check(inventoryPage.title, 'Título del catálogo visible', async () => {
      await expect.soft(page).toHaveURL(/inventory\.html/);
      await expect.soft(inventoryPage.title).toHaveText('Products');
    });
  });
});
