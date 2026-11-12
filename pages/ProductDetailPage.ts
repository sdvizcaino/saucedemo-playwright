import type { Locator, Page } from '@playwright/test';

/** Detalle de un producto. */
export class ProductDetailPage {
  readonly name: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly backButton: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('inventory-item-name');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.backButton = page.getByTestId('back-to-products');
  }
}
