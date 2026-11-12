import type { Locator, Page } from '@playwright/test';
import type { User } from '../data/users';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(user: User): Promise<void> {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }
}
