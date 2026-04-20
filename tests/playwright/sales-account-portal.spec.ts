import { expect, test } from '@playwright/test';

const customerEmail = process.env.GX_CUSTOMER_EMAIL || '';
const customerPassword = process.env.GX_CUSTOMER_PASSWORD || '';

function hasCustomerCreds() {
  return Boolean(customerEmail && customerPassword);
}

async function expectStandaloneRequirementPage(
  page: import('@playwright/test').Page,
  entryUrl: string,
) {
  await page.goto(entryUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForURL((url) => url.pathname.endsWith('/quote/requirement.html'), { timeout: 20000 });
  await expect(page.locator('#requirement-app')).toBeVisible({ timeout: 20000 });
  await expect(page).toHaveURL(/\/quote\/requirement\.html\?req=req-demo-001&token=tok-demo-001/);
}

async function expectStandaloneConfirmationPage(
  page: import('@playwright/test').Page,
  entryUrl: string,
) {
  await page.goto(entryUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForURL((url) => url.pathname.endsWith('/quote/confirmation.html'), { timeout: 20000 });
  await expect(page.locator('#stage-confirmation-app')).toBeVisible({ timeout: 20000 });
  await expect(page).toHaveURL(/\/quote\/confirmation\.html\?stage=stage-demo-001&token=tok-demo-001/);
}

test.describe('Sales account center portal funnel', () => {
  test('requirement link stays on standalone requirement page', async ({ page }) => {
    await expectStandaloneRequirementPage(
      page,
      '/quote/requirement.html?req=req-demo-001&token=tok-demo-001',
    );
  });

  test('stage confirmation link stays on standalone confirmation page', async ({ page }) => {
    await expectStandaloneConfirmationPage(
      page,
      '/quote/confirmation.html?stage=stage-demo-001&token=tok-demo-001',
    );
  });

  test('customer can open account sales pipeline page', async ({ page }) => {
    test.skip(!hasCustomerCreds(), 'Missing GX_CUSTOMER_EMAIL or GX_CUSTOMER_PASSWORD');

    await page.goto('/account/user.html');
    await expect(page.locator('#auth-form')).toBeVisible({ timeout: 15000 });
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#auth-form button[type=\"submit\"]').click();
    await page.waitForURL((url) => url.pathname.endsWith('/account/account.html') || url.pathname.endsWith('/account/sales.html'), { timeout: 30000 });

    await page.goto('/account/sales.html');
    await expect(page.locator('a[href=\"/account/sales.html\"].active')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#sales-pipeline-root')).toBeVisible({ timeout: 20000 });
  });
});
