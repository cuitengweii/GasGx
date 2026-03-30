import { expect, test } from '@playwright/test';

const customerEmail = process.env.GX_CUSTOMER_EMAIL || '';
const customerPassword = process.env.GX_CUSTOMER_PASSWORD || '';

function hasCustomerCreds() {
  return Boolean(customerEmail && customerPassword);
}

async function expectLegacyFunnel(
  page: import('@playwright/test').Page,
  entryUrl: string,
  expectedTokens: string[],
) {
  await page.goto(entryUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForURL((url) => {
    return url.pathname.endsWith('/account/user.html')
      || url.pathname.endsWith('/account/sales.html');
  }, { timeout: 20000 });

  const current = new URL(page.url());
  if (current.pathname.endsWith('/account/user.html')) {
    const returnUrl = await page.evaluate(() => window.sessionStorage.getItem('gx_main_return_url') || '');
    expect(returnUrl).toContain('/account/sales.html');
    expectedTokens.forEach((token) => expect(returnUrl).toContain(token));
    return;
  }

  expect(current.pathname).toContain('/account/sales.html');
  expectedTokens.forEach((token) => expect(current.search).toContain(token));
}

test.describe('Sales account center portal funnel', () => {
  test('legacy requirement link routes to account-center funnel', async ({ page }) => {
    await expectLegacyFunnel(
      page,
      '/quote/requirement.html?req=req-demo-001&token=tok-demo-001',
      ['req=req-demo-001', 'req_token=tok-demo-001'],
    );
  });

  test('legacy stage confirmation link routes to account-center funnel', async ({ page }) => {
    await expectLegacyFunnel(
      page,
      '/quote/confirmation.html?stage=stage-demo-001&token=tok-demo-001',
      ['confirm_stage=stage-demo-001', 'confirm_token=tok-demo-001'],
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
