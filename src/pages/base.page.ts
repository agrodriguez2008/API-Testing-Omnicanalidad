import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Capacidades compartidas por todos los Page Objects: navegación, acciones y
 * asserts. Los Page Objects concretos (LoginPage, etc.) nunca hablan
 * directamente con Playwright — pasan siempre por aquí.
 */
export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }

  protected byTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  protected async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  protected async expectUrl(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  protected async expectText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toHaveText(text);
  }
}
