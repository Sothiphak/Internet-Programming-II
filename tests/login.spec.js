import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  
  // This runs before every single test in this file
  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
  });

  test('login with valid credentials', async ({ page }) => {
    // Fill in credentials using user-friendly placeholder locators
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: /login/i }).click();

    // Assert successful redirect to the inventory page
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('login fails with wrong password', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('wrong_password');
    await page.getByRole('button', { name: /login/i }).click();

    // Assert that the error element contains the correct message
    await expect(page.locator('[data-test="error"]'))
      .toContainText('Username and password do not match');
  });
});