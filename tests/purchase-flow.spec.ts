import { test, expect } from '../fixtures/test';
import { users } from '../data/users';
import { customer } from '../data/checkout';
import { products, TAX_RATE, money } from '../data/products';

/**
 * Flujo de compra completo: Login → Producto → Carrito → Checkout → Confirmación.
 * Cada test es independiente: hace su propio login y prepara su propio estado.
 */
test.describe('Flujo de compra (standard_user)', () => {
  test('TC-01 Login exitoso con credenciales válidas @smoke @regression', async ({
    page,
    loginPage,
    inventoryPage,
    check,
  }) => {
    await loginPage.goto();
    await loginPage.login(users.standard);

    await check(inventoryPage.title, 'Accede al catálogo', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
      await expect.soft(inventoryPage.title).toHaveText('Products');
    });
    await check(inventoryPage.items.first(), 'Catálogo con 6 productos', async () => {
      await expect.soft(inventoryPage.items).toHaveCount(6);
    });
  });

  test.describe('con sesión iniciada', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(users.standard);
    });

    test('TC-02 El detalle corresponde al producto seleccionado @regression', async ({
      inventoryPage,
      productDetailPage,
      check,
    }) => {
      await inventoryPage.item(products.backpack.name).getByTestId('inventory-item-name').click();

      await check(productDetailPage.name, 'Nombre del detalle = producto elegido', async () => {
        await expect.soft(productDetailPage.name).toHaveText(products.backpack.name);
      });
      await check(productDetailPage.price, 'Precio del detalle = precio del catálogo', async () => {
        await expect.soft(productDetailPage.price).toHaveText(money(products.backpack.price));
      });
      await check(productDetailPage.addToCartButton, 'Se puede agregar desde el detalle', async () => {
        await expect.soft(productDetailPage.addToCartButton).toBeEnabled();
      });
    });

    test('TC-03 Agregar varios productos al carrito @regression', async ({ inventoryPage, check }) => {
      await inventoryPage.addToCart(products.backpack.name);
      await inventoryPage.addToCart(products.onesie.name);

      await check(inventoryPage.cartBadge, 'Contador del carrito = 2', async () => {
        await expect.soft(inventoryPage.cartBadge).toHaveText('2');
      });
      for (const product of [products.backpack, products.onesie]) {
        const removeButton = inventoryPage.item(product.name).getByRole('button', { name: 'Remove' });
        await check(removeButton, `"${product.name}" cambia a Remove`, async () => {
          await expect.soft(removeButton).toBeVisible();
        });
      }
    });

    test('TC-04 El carrito refleja exactamente la selección @regression', async ({
      inventoryPage,
      cartPage,
      check,
    }) => {
      await inventoryPage.addToCart(products.backpack.name);
      await inventoryPage.addToCart(products.onesie.name);
      await inventoryPage.openCart();

      await check(cartPage.items.first(), 'El carrito lista solo los 2 productos agregados', async () => {
        await expect.soft(cartPage.itemNames).toHaveText([products.backpack.name, products.onesie.name]);
      });
      await check(cartPage.items.first(), 'Cantidad 1 por producto', async () => {
        await expect.soft(cartPage.items.getByTestId('item-quantity')).toHaveText(['1', '1']);
      });
    });

    test('TC-05 Quitar un producto desde el carrito @regression', async ({
      page,
      inventoryPage,
      cartPage,
      check,
    }) => {
      await inventoryPage.addToCart(products.backpack.name);
      await inventoryPage.addToCart(products.onesie.name);
      await inventoryPage.openCart();
      await cartPage.items.filter({ hasText: products.onesie.name }).getByRole('button', { name: 'Remove' }).click();

      await check(cartPage.items.first(), 'Queda solo el Backpack', async () => {
        await expect.soft(cartPage.itemNames).toHaveText([products.backpack.name]);
      });
      await check(page.getByTestId('shopping-cart-badge'), 'Contador del carrito = 1', async () => {
        await expect.soft(page.getByTestId('shopping-cart-badge')).toHaveText('1');
      });
    });

    test('TC-06 Checkout con datos válidos del comprador @smoke @regression', async ({
      page,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      check,
    }) => {
      await inventoryPage.addToCart(products.backpack.name);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.fill(customer);
      await checkoutInfoPage.continue();

      await check(checkoutOverviewPage.itemNames.first(), 'Avanza al resumen con el mismo producto', async () => {
        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect.soft(checkoutOverviewPage.itemNames).toHaveText([products.backpack.name]);
      });
    });

    test('TC-07 Totales correctos en el resumen @smoke @regression', async ({
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      check,
    }) => {
      const selected = [products.backpack, products.onesie];
      for (const product of selected) await inventoryPage.addToCart(product.name);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.fill(customer);
      await checkoutInfoPage.continue();

      const subtotal = selected.reduce((sum, product) => sum + product.price, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

      await check(checkoutOverviewPage.subtotal, `Subtotal = ${money(subtotal)}`, async () => {
        await expect.soft(checkoutOverviewPage.subtotal).toHaveText(`Item total: ${money(subtotal)}`);
      });
      await check(checkoutOverviewPage.tax, `Impuesto 8 % = ${money(tax)}`, async () => {
        await expect.soft(checkoutOverviewPage.tax).toHaveText(`Tax: ${money(tax)}`);
      });
      await check(checkoutOverviewPage.total, `Total = ${money(subtotal + tax)}`, async () => {
        await expect.soft(checkoutOverviewPage.total).toHaveText(`Total: ${money(subtotal + tax)}`);
      });
    });

    test('TC-08 Confirmación de la compra @smoke @regression', async ({
      page,
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      checkoutCompletePage,
      check,
    }) => {
      await inventoryPage.addToCart(products.backpack.name);
      await inventoryPage.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.fill(customer);
      await checkoutInfoPage.continue();
      await checkoutOverviewPage.finish();

      await check(checkoutCompletePage.header, 'Mensaje de confirmación', async () => {
        await expect.soft(checkoutCompletePage.header).toHaveText('Thank you for your order!');
      });
      await check(page.getByTestId('shopping-cart-link'), 'El carrito queda vacío', async () => {
        await expect.soft(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
      });
    });
  });
});
