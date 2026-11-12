import { test, expect } from '../fixtures/test';
import { users } from '../data/users';
import { products, money } from '../data/products';
import type { SortOption } from '../pages/InventoryPage';

/** Ordenamiento del catálogo: el resultado esperado se calcula desde los datos, no se escribe a mano. */
const catalog = Object.values(products);
const byName = [...catalog].sort((a, b) => a.name.localeCompare(b.name));
const byPrice = [...catalog].sort((a, b) => a.price - b.price);

const cases: { option: SortOption; label: string; by: 'name' | 'price'; expected: string[] }[] = [
  { option: 'az', label: 'Nombre (A a Z)', by: 'name', expected: byName.map((p) => p.name) },
  { option: 'za', label: 'Nombre (Z a A)', by: 'name', expected: [...byName].reverse().map((p) => p.name) },
  { option: 'lohi', label: 'Precio (menor a mayor)', by: 'price', expected: byPrice.map((p) => money(p.price)) },
  { option: 'hilo', label: 'Precio (mayor a menor)', by: 'price', expected: [...byPrice].reverse().map((p) => money(p.price)) },
];

test.describe('Ordenamiento del catálogo (standard_user) @sort', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard);
  });

  for (const { option, label, by, expected } of cases) {
    test(`SORT-${option} ${label} @regression`, async ({ inventoryPage, check }) => {
      await inventoryPage.sortBy(option);
      const list = by === 'name' ? inventoryPage.itemNames : inventoryPage.itemPrices;

      await check(inventoryPage.sortSelect, `Opción seleccionada: ${label}`, async () => {
        await expect.soft(inventoryPage.sortSelect).toHaveValue(option);
      });
      await check(list.first(), `Catálogo ordenado por ${label}`, async () => {
        await expect.soft(list).toHaveText(expected);
      });
    });
  }
});
