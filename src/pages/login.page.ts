import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Pantalla de login de Swag Labs (Sauce Demo). */
export class LoginPage extends BasePage {
  protected readonly path = '/';

  private readonly usernameField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameField = this.byTestId('username');
    this.passwordField = this.byTestId('password');
    this.loginButton = this.byTestId('login-button');
    this.errorMessage = this.byTestId('error');
  }

  async signInAs(username: string, password: string): Promise<void> {
    await this.fill(this.usernameField, username);
    await this.fill(this.passwordField, password);
    await this.click(this.loginButton);
  }

  async expectOnProductsPage(): Promise<void> {
    await this.expectUrl(/inventory/);
    await this.expectText(this.page.locator('.title'), 'Products');
  }

  async expectError(message: string): Promise<void> {
    await this.expectText(this.errorMessage, message);
  }
}
