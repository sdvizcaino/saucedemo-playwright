import type { Locator, Page } from '@playwright/test';

/** Confirmación de la compra. */
export class CheckoutCompletePage {
  readonly header: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.header = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }
}
