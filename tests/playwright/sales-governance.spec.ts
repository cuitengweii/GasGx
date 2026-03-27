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

async function confirmDialog(page: import('@playwright/test').Page) {
  const submit = page.locator('[data-sales-confirm-submit]').last();
  await expect(submit).toBeVisible({ timeout: 10000 });
  await submit.click();
}

async function selectFirstNonEmptyOption(page: import('@playwright/test').Page, selector: string) {
  const value = await page.evaluate((inputSelector) => {
    const node = document.querySelector(inputSelector) as HTMLSelectElement | null;
    if (!node) return '';
    const target = Array.from(node.options).map((item) => item.value).find((item) => item && item.trim());
    if (!target) return '';
    node.value = target;
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
    return target;
  }, selector);
  return value;
}

test.describe('Sales governance guards', () => {
  test.setTimeout(300000);

  test('customer account cannot access sales admin console', async ({ page }) => {
    test.skip(!hasCustomerCreds(), 'Missing GX_CUSTOMER_EMAIL or GX_CUSTOMER_PASSWORD');

    await page.goto('/account/user.html');
    await expect(page.locator('#auth-form')).toBeVisible();
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#submit-btn').click();
    await page.waitForURL((url) => !url.pathname.endsWith('/account/user.html'), { timeout: 20000 });

    await page.goto('/article_management/sales/index.html?page=quote-customers');
    await expect(page.locator('#ams-login-form')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.ams-app-sales')).toHaveCount(0);
  });

  test('quote cannot be advanced to contract before customer confirmation', async ({ page, browser }) => {
    test.skip(!hasAdminCreds(), 'Missing GX_ADMIN_EMAIL or GX_ADMIN_PASSWORD');

    const uniqueTag = `E2E-GUARD-${Date.now()}`;
    const seededCustomerEmail = `formal-guard-${Date.now()}@example.com`;
    const phone = `+86-13${String(Date.now()).slice(-9)}`;

    await page.goto('/article_management/sales/index.html?page=quote-customers');
    await expect(page.locator('#ams-login-form')).toBeVisible();
    await page.fill('#ams-login-email', adminEmail);
    await page.fill('#ams-login-password', adminPassword);
    await page.locator('#ams-login-form button[type="submit"]').click();
    await expect(page.locator('.ams-app-sales')).toBeVisible({ timeout: 20000 });

    await page.goto('/article_management/sales/index.html?page=quote-customers');
    await page.click('#ams-quote-customer-new');
    const companyName = `Formal ${uniqueTag}`;
    await page.fill('[data-customer-field="company_name"]:visible', companyName);
    await page.fill('[data-customer-field="email"]:visible', seededCustomerEmail);
    await page.fill('[data-customer-field="notes"]:visible', `governance guard ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');

    await page.waitForURL((url) => url.searchParams.get('page') === 'quote-customer-flow' && url.searchParams.get('stage') === 'requirement_capture', { timeout: 30000 });

    const requirementLink = await page.locator('a.ams-inline-link').first().getAttribute('href');
    expect(requirementLink).toBeTruthy();

    const customerPage = await browser.newPage();
    await customerPage.goto(requirementLink!);
    await customerPage.fill('[data-field="requester_company"]', companyName);
    await customerPage.fill('[data-field="requester_name"]', 'Flow Guard');
    await customerPage.fill('[data-field="requester_email"]', seededCustomerEmail);
    await customerPage.fill('[data-field="requester_phone"]', phone);
    await selectFirstNonEmptyOption(customerPage, '[data-field="country"]');
    await selectFirstNonEmptyOption(customerPage, '[data-field="requirement_type"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="contact_channel"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="deployment_mode"]');
    const firstBrand = customerPage.locator('[data-answer-check="miner_brands"]').first();
    if (await firstBrand.count()) await firstBrand.check();
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="miner_model"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="miner_hashrate_band"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="miner_power_band"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="miner_quantity_band"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="voltage_frequency"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="power_capacity_band"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="container_preference"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="silent_requirement"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="budget_band"]');
    await selectFirstNonEmptyOption(customerPage, '[data-answer-field="timeline_band"]');
    await customerPage.check('#requirement-submit-confirm');
    await customerPage.click('#requirement-submit');
    await expect(customerPage.locator('#requirement-submit-status')).toContainText(/submitted|已提�?/i, { timeout: 30000 });

    const flowUrl = new URL(page.url());
    const customerId = flowUrl.searchParams.get('customer') || '';
    const dealId = flowUrl.searchParams.get('deal') || '';
    expect(customerId).toBeTruthy();
    expect(dealId).toBeTruthy();

    await page.goto(`/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(customerId)}&deal=${encodeURIComponent(dealId)}&stage=requirement_confirmed`);
    await page.click('#ams-sales-flow-requirement-confirm');
    await confirmDialog(page);
    await page.waitForURL((url) => url.searchParams.get('stage') === 'quote_draft', { timeout: 30000 });

    const productSelect = page.locator('#ams-sales-flow-instance-product');
    await expect(productSelect).toBeVisible({ timeout: 20000 });
    const options = await productSelect.locator('option').all();
    let chosenValue = '';
    for (const option of options) {
      const value = (await option.getAttribute('value')) || '';
      const label = ((await option.textContent()) || '').trim();
      const disabled = await option.getAttribute('disabled');
      const placeholderLike = /请选择|先选择|暂无|无可用|select/i.test(label);
      if (value.trim() && !disabled && !placeholderLike) {
        chosenValue = value;
        break;
      }
    }
    expect(chosenValue).toBeTruthy();
    await productSelect.selectOption(chosenValue);
    await page.click('#ams-sales-flow-instance-create');
    await expect(page.locator('#ams-sales-flow-instance-open-inline')).toBeVisible({ timeout: 30000 });

    const editorPopupPromise = page.waitForEvent('popup');
    await page.click('#ams-sales-flow-instance-open-inline');
    const editorPopup = await editorPopupPromise;
    await editorPopup.waitForURL(/\/quote\/editor\.html\?/, { timeout: 30000 });
    await editorPopup.locator('#btn-publish-instance').click();
    await editorPopup.waitForURL(/\/article_management\/sales\/index\.html\?/, { timeout: 60000 });
    await editorPopup.close();

    await page.goto(`/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(customerId)}&deal=${encodeURIComponent(dealId)}&stage=quote_confirmed`);
    const confirmBtn = page.locator('#ams-sales-flow-instance-confirm');
    await expect(confirmBtn).toBeVisible({ timeout: 30000 });
    await expect(confirmBtn).toBeDisabled();

    await customerPage.close();
  });
});
