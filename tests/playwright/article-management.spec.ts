import { expect, test } from '@playwright/test';

test.describe('Article Management System', () => {
  test('shows login screen for anonymous visitor', async ({ page }) => {
    await page.goto('/article_management/index.html');

    await expect(page.locator('#ams-login-form')).toBeVisible();
    await expect(page.locator('#ams-login-email')).toBeVisible();
    await expect(page.locator('#ams-login-password')).toBeVisible();
    await expect(page.locator('text=Article Management System')).toBeVisible();
  });

  test('has expected login placeholders', async ({ page }) => {
    await page.goto('/article_management/index.html');

    await expect(page.locator('#ams-login-email')).toHaveAttribute('placeholder', 'cuitengwei@gasgx.com');
    await expect(page.locator('#ams-login-password')).toHaveAttribute('type', 'password');
  });
});

