import { expect, test } from '@playwright/test';

const adminEmail = process.env.GX_ADMIN_EMAIL || '';
const adminPassword = process.env.GX_ADMIN_PASSWORD || '';
const customerEmail = process.env.GX_CUSTOMER_EMAIL || '';
const customerPassword = process.env.GX_CUSTOMER_PASSWORD || '';

function hasAdminCreds() {
  return Boolean(adminEmail && adminPassword);
}

function hasCustomerCreds() {
  return Boolean(customerEmail && customerPassword);
}

test.describe('Sales auth role simulation', () => {
  test('admin can sign in to sales console', async ({ page }) => {
    test.skip(!hasAdminCreds(), 'Missing GX_ADMIN_EMAIL or GX_ADMIN_PASSWORD');

    await page.goto('/article_management/sales/index.html');
    await expect(page.locator('#ams-login-form')).toBeVisible();

    await page.fill('#ams-login-email', adminEmail);
    await page.fill('#ams-login-password', adminPassword);
    await page.locator('#ams-login-form button[type="submit"]').click();

    await expect(page.locator('.ams-app-sales')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.ams-nav-btn[data-page="dashboard"]')).toBeVisible();
  });

  test('customer can sign in from public account page', async ({ page }) => {
    test.skip(!hasCustomerCreds(), 'Missing GX_CUSTOMER_EMAIL or GX_CUSTOMER_PASSWORD');

    await page.goto('/account/user.html');
    await expect(page.locator('#auth-form')).toBeVisible();

    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#submit-btn').click();

    await page.waitForURL((url) => !url.pathname.endsWith('/account/user.html'), { timeout: 20000 });
    await expect(page.url()).toContain('/account/');
  });
});
