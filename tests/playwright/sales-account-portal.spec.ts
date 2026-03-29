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
  await page.goto(entryUrl);
  await page.waitForURL((url) => {
    return url.pathname.endsWith('/account/user.html')
      || (url.pathname.endsWith('/account/account.html') && url.searchParams.get('tab') === 'sales');
  }, { timeout: 20000 });

  const current = new URL(page.url());
  if (current.pathname.endsWith('/account/user.html')) {
    const returnUrl = await page.evaluate(() => window.sessionStorage.getItem('gx_main_return_url') || '');
    expect(returnUrl).toContain('/account/account.html?tab=sales');
    expectedTokens.forEach((token) => expect(returnUrl).toContain(token));
    return;
  }

  expect(current.pathname).toContain('/account/account.html');
  expect(current.searchParams.get('tab')).toBe('sales');
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

  test('customer can open account sales pipeline tab', async ({ page }) => {
    test.skip(!hasCustomerCreds(), 'Missing GX_CUSTOMER_EMAIL or GX_CUSTOMER_PASSWORD');

    await page.goto('/account/user.html');
    await expect(page.locator('#auth-form')).toBeVisible({ timeout: 15000 });
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#auth-form button[type=\"submit\"]').click();
    await page.waitForURL(/\/account\/account\.html/, { timeout: 30000 });

    await page.goto('/account/account.html?tab=sales');
    await expect(page.locator('#nav-sales')).toHaveClass(/active/, { timeout: 20000 });
    await expect(page.locator('#tab-sales')).toHaveClass(/active/, { timeout: 20000 });
    await expect(page.locator('#sales-pipeline-root')).toBeVisible({ timeout: 20000 });
  });
});

