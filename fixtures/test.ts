import { test as base, type Locator } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { verify } from '../utils/evidence';

type Check = (target: Locator, description: string, assertion: () => Promise<void>) => Promise<void>;

interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  /** Valida con evidencia: recuadro rojo + screenshot OK/FAIL adjunto al reporte. */
  check: Check;
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productDetailPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
  check: async ({ page }, use, testInfo) => {
    await use((target, description, assertion) => verify(page, testInfo, target, description, assertion));
  },
});

export { expect } from '@playwright/test';
