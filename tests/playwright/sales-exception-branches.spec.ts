import { expect, test } from '@playwright/test';

const adminEmail = process.env.GX_ADMIN_EMAIL || '';
const adminPassword = process.env.GX_ADMIN_PASSWORD || '';

function hasAdminCreds() {
  return Boolean(adminEmail && adminPassword);
}

async function confirmDialog(page: import('@playwright/test').Page) {
  const submit = page.locator('[data-sales-confirm-submit]').last();
  await expect(submit).toBeVisible({ timeout: 10000 });
  await submit.click({ noWaitAfter: true });
}

async function adminLogin(page: import('@playwright/test').Page) {
  await page.goto('/article_management/sales/index.html?page=quote-customers');
  await expect(page.locator('#ams-login-form')).toBeVisible();
  await page.fill('#ams-login-email', adminEmail);
  await page.fill('#ams-login-password', adminPassword);
  await page.locator('#ams-login-form button[type="submit"]').click();
  await expect(page.locator('.ams-app-sales')).toBeVisible({ timeout: 20000 });
}

async function createRequirementCaptureDeal(page: import('@playwright/test').Page, tag: string) {
  await page.goto('/article_management/sales/index.html?page=quote-customers');
  await expect(page.locator('#ams-quote-customer-new')).toBeVisible({ timeout: 20000 });
  await page.click('#ams-quote-customer-new');

  const companyName = `Formal ${tag}`;
  const email = `formal-ex-${Date.now()}@example.com`;
  await page.fill('[data-customer-field="company_name"]:visible', companyName);
  await page.fill('[data-customer-field="email"]:visible', email);
  await page.fill('[data-customer-field="notes"]:visible', `exception branch ${tag}`);
  await page.click('#ams-quote-customer-save');

  await page.waitForURL((url) => {
    return url.searchParams.get('page') === 'quote-customer-flow'
      && url.searchParams.get('stage') === 'requirement_capture';
  }, { timeout: 30000 });

  const url = new URL(page.url());
  const dealId = url.searchParams.get('deal') || '';
  expect(dealId).toBeTruthy();
  return { dealId, companyName };
}

test.describe('Sales exception branches', () => {
  test.setTimeout(300000);

  test('archive action removes deal from active stage list', async ({ page }) => {
    test.skip(!hasAdminCreds(), 'Missing GX_ADMIN_EMAIL or GX_ADMIN_PASSWORD');

    await adminLogin(page);
    const { dealId } = await createRequirementCaptureDeal(page, `ARCHIVE-${Date.now()}`);

    await page.goto(`/article_management/sales/index.html?page=quote-pipeline&stage=requirement_capture&deal=${encodeURIComponent(dealId)}`);
    const archiveBtn = page.locator(`[data-sales-stage-archive="${dealId}"]`);
    await expect(archiveBtn).toBeVisible({ timeout: 30000 });
    await archiveBtn.click();
    await confirmDialog(page);

    await expect(page.locator(`[data-sales-stage-archive="${dealId}"]`)).toHaveCount(0, { timeout: 30000 });
    await expect(page.locator(`[data-sales-stage-void="${dealId}"]`)).toHaveCount(0, { timeout: 30000 });
  });

  test('void action removes deal from active stage list', async ({ page }) => {
    test.skip(!hasAdminCreds(), 'Missing GX_ADMIN_EMAIL or GX_ADMIN_PASSWORD');

    await adminLogin(page);
    const { dealId } = await createRequirementCaptureDeal(page, `VOID-${Date.now()}`);

    await page.goto(`/article_management/sales/index.html?page=quote-pipeline&stage=requirement_capture&deal=${encodeURIComponent(dealId)}`);
    const voidBtn = page.locator(`[data-sales-stage-void="${dealId}"]`);
    await expect(voidBtn).toBeVisible({ timeout: 30000 });
    await voidBtn.click();
    await confirmDialog(page);

    await expect(page.locator(`[data-sales-stage-archive="${dealId}"]`)).toHaveCount(0, { timeout: 30000 });
    await expect(page.locator(`[data-sales-stage-void="${dealId}"]`)).toHaveCount(0, { timeout: 30000 });
  });
});
