const { test, expect } = require('@playwright/test');

test.describe('Sauce Demo - Extra Challenges', () => {

  // Challenge 1: Locked Out User Assertion
  test('Challenge 1 - login fails with locked_out_user', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: /login/i }).click();

    // Verify the explicit error message for locked users
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Sorry, this user has been locked out.');
  });

  // Challenge 2: Price Sorting (Low to High) Verification
  test('Challenge 2 - sort products by price low to high', async ({ page }) => {
    // Log in first
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: /login/i }).click();

    // Select the "Price (low to high)" option from the dropdown menu
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    // Grab all price elements on the page
    const priceElements = page.locator('.inventory_item_price');
    
    // Assert that the very first item price is the cheapest ($7.99)
    await expect(priceElements.first()).toHaveText('$7.99');
  });

  // Challenge 3: Application Logout Flow
  test('Challenge 3 - complete application logout', async ({ page }) => {
    // Log in first
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: /login/i }).click();

    // Open the hidden sidebar burger menu
    await page.getByRole('button', { name: /open menu/i }).click();

    // Click the sidebar logout link
    await page.locator('[data-test="logout-sidebar-link"]').click();

    // Assert that we are booted back to the login clean slate screen
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });
});