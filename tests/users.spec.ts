import { test, expect } from '../fixtures/test';
import { users } from '../data/users';
import { customer } from '../data/checkout';
import { products, money } from '../data/products';
import { PERF_BUDGET } from '../data/performance';

/**
 * Usuarios con comportamiento defectuoso conocido.
 * Estos tests esperan el comportamiento CORRECTO, así que hoy fallan: cada falla es evidencia de un bug.
 */
test.describe('problem_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.problem);
  });

  test('USR-01 Los datos del comprador quedan en su campo @regression', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    check,
  }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.fill(customer);

    await check(checkoutInfoPage.firstName, `Nombre = "${customer.firstName}"`, async () => {
      await expect.soft(checkoutInfoPage.firstName).toHaveValue(customer.firstName);
    });
    await check(checkoutInfoPage.lastName, `Apellido = "${customer.lastName}"`, async () => {
      await expect.soft(checkoutInfoPage.lastName).toHaveValue(customer.lastName);
    });

    await checkoutInfoPage.continue();
    await check(page.getByTestId('title'), 'Avanza al resumen del checkout', async () => {
      await expect.soft(page).toHaveURL(/checkout-step-two\.html/);
    });
  });

  test('USR-02 Se pueden agregar todos los productos al carrito @regression', async ({
    inventoryPage,
    check,
  }) => {
    const allProducts = Object.values(products);
    for (const product of allProducts) await inventoryPage.addToCart(product.name);

    for (const product of allProducts) {
      const button = inventoryPage.itemButton(product.name);
      await check(button, `"${product.name}" agregado (botón Remove)`, async () => {
        await expect.soft(button).toHaveText('Remove');
      });
    }
    await check(inventoryPage.cartBadge, `Contador del carrito = ${allProducts.length}`, async () => {
      await expect.soft(inventoryPage.cartBadge).toHaveText(String(allProducts.length));
    });
  });

  test('USR-03 El detalle corresponde al producto seleccionado @regression', async ({
    inventoryPage,
    productDetailPage,
    check,
  }) => {
    await inventoryPage.item(products.backpack.name).getByTestId('inventory-item-name').click();

    await check(productDetailPage.name, `Detalle = "${products.backpack.name}"`, async () => {
      await expect.soft(productDetailPage.name).toHaveText(products.backpack.name);
    });
    await check(productDetailPage.price, `Precio = ${money(products.backpack.price)}`, async () => {
      await expect.soft(productDetailPage.price).toHaveText(money(products.backpack.price));
    });
  });
});

test.describe('performance_glitch_user', () => {
  // Este usuario es lento a propósito: se da margen a las esperas para medir sin que el test se caiga.
  const SLOW_TIMEOUT = 15_000;

  test('USR-04 Tiempos de respuesta dentro del presupuesto @regression', async ({
    loginPage,
    inventoryPage,
    check,
  }) => {
    await loginPage.goto();

    let start = Date.now();
    await loginPage.login(users.performanceGlitch);
    await expect(inventoryPage.title).toBeVisible({ timeout: SLOW_TIMEOUT });
    const loginMs = Date.now() - start;

    await check(inventoryPage.title, `Login → catálogo ≤ ${PERF_BUDGET.navigationMs} ms (medido: ${loginMs} ms)`, async () => {
      expect.soft(loginMs).toBeLessThanOrEqual(PERF_BUDGET.navigationMs);
    });

    start = Date.now();
    await inventoryPage.sortBy('hilo');
    await expect(inventoryPage.itemPrices.first()).toHaveText(money(products.fleeceJacket.price), {
      timeout: SLOW_TIMEOUT,
    });
    const sortMs = Date.now() - start;

    await check(inventoryPage.sortSelect, `Ordenar ≤ ${PERF_BUDGET.interactionMs} ms (medido: ${sortMs} ms)`, async () => {
      expect.soft(sortMs).toBeLessThanOrEqual(PERF_BUDGET.interactionMs);
    });
  });
});
