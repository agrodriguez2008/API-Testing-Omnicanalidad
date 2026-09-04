import { Given, When, Then } from '@fixtures/test';

Given('que estoy en la página de login', async ({ loginPage }) => {
  await loginPage.open();
});

When(
  'ingreso el usuario {string} y la contraseña {string}',
  async ({ loginPage }, user: string, pass: string) => {
    await loginPage.signInAs(user, pass);
  },
);

Then('debería ver la página de productos', async ({ loginPage }) => {
  await loginPage.expectOnProductsPage();
});

Then('veo el error {string}', async ({ loginPage }, message: string) => {
  await loginPage.expectError(message);
});
