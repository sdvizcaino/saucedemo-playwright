import { test, expect } from '../fixtures/test';
import { users } from '../data/users';
import { customer, type Customer } from '../data/checkout';
import { products } from '../data/products';

/**
 * Casos negativos: el sistema debe bloquear entradas y caminos inválidos.
 * CN-01 y CN-03 fallan hoy a propósito: documentan bugs reales (el CI queda en rojo como evidencia).
 */
test.describe('Casos negativos @negative', () => {
  test.describe('con sesión iniciada (standard_user)', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(users.standard);
    });

    test('CN-01 No se puede iniciar el checkout con el carrito vacío @regression', async ({
      page,
      inventoryPage,
      cartPage,
      check,
    }) => {
      await inventoryPage.openCart();
      await expect(cartPage.items).toHaveCount(0);
      await cartPage.checkout();

      // Se resalta el título de la página en la que quedó el usuario.
      await check(page.getByTestId('title'), 'El checkout no avanza con el carrito vacío', async () => {
        await expect.soft(page).toHaveURL(/cart\.html/);
      });
    });

    test.describe('en el paso de datos del comprador', () => {
      test.beforeEach(async ({ inventoryPage, cartPage }) => {
        await inventoryPage.addToCart(products.backpack.name);
        await inventoryPage.openCart();
        await cartPage.checkout();
      });

      const missingFields: { field: string; data: Customer }[] = [
        { field: 'First Name', data: { ...customer, firstName: '' } },
        { field: 'Last Name', data: { ...customer, lastName: '' } },
        { field: 'Postal Code', data: { ...customer, postalCode: '' } },
      ];

      for (const { field, data } of missingFields) {
        test(`CN-02 Campo obligatorio vacío: ${field} @regression`, async ({ page, checkoutInfoPage, check }) => {
          await checkoutInfoPage.fill(data);
          await checkoutInfoPage.continue();

          await check(checkoutInfoPage.errorMessage, `Error "${field} is required"`, async () => {
            await expect.soft(checkoutInfoPage.errorMessage).toHaveText(`Error: ${field} is required`);
            await expect.soft(page).toHaveURL(/checkout-step-one\.html/);
          });
        });
      }

      test('CN-03 Campos con solo espacios se tratan como vacíos @regression', async ({
        page,
        checkoutInfoPage,
        check,
      }) => {
        await checkoutInfoPage.fill({ firstName: '   ', lastName: '   ', postalCode: '   ' });
        await checkoutInfoPage.continue();

        await check(page.getByTestId('title'), 'Muestra error y no avanza con datos en blanco', async () => {
          await expect.soft(checkoutInfoPage.errorMessage).toBeVisible();
          await expect.soft(page).toHaveURL(/checkout-step-one\.html/);
        });
      });
    });
  });

  test('CN-04 Usuario bloqueado no puede ingresar @regression', async ({ page, loginPage, check }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut);

    await check(loginPage.errorMessage, 'Mensaje de usuario bloqueado', async () => {
      await expect.soft(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
      await expect.soft(page).not.toHaveURL(/inventory\.html/);
    });
  });

  test('CN-05 Acceso directo al checkout sin sesión @regression', async ({ page, loginPage, check }) => {
    await page.goto('/checkout-step-two.html');

    await check(loginPage.errorMessage, 'Redirige al login con acceso restringido', async () => {
      await expect.soft(loginPage.loginButton).toBeVisible();
      await expect.soft(loginPage.errorMessage).toContainText(
        "You can only access '/checkout-step-two.html' when you are logged in.",
      );
    });
  });
});
