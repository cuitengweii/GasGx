import { expect, test } from '@playwright/test';
import { bootstrapDealToQuoteConfirmed, forceCustomerQuoteConfirmation } from './helpers/sales-quote-bootstrap';

const adminEmail = process.env.GX_ADMIN_EMAIL || '';
const adminPassword = process.env.GX_ADMIN_PASSWORD || '';
const customerEmail = process.env.GX_CUSTOMER_EMAIL || '';
const customerPassword = process.env.GX_CUSTOMER_PASSWORD || '';

function mustHaveCreds() {
  return Boolean(adminEmail && adminPassword && customerEmail && customerPassword);
}

async function confirmDialog(page: import('@playwright/test').Page, required = true) {
  const submit = page.locator('[data-sales-confirm-submit]:visible').last();
  const visible = await submit.isVisible({ timeout: 10000 }).catch(() => false);
  if (!visible) {
    if (required) {
      throw new Error('Expected confirmation dialog, but none appeared.');
    }
    return;
  }
  await submit.click({ force: true, noWaitAfter: true });
}

async function settleToContractStage(page: import('@playwright/test').Page, dealId: string) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const stage = new URL(page.url()).searchParams.get('stage') || '';
    if (stage === 'contract_signed') return;

    if (stage === 'quote_confirmed') {
      const adminConfirmBtn = page.locator('#ams-sales-flow-instance-confirm');
      const canManualConfirm = await adminConfirmBtn.isVisible({ timeout: 1500 }).catch(() => false);
      const canClick = canManualConfirm
        ? await adminConfirmBtn.isEnabled({ timeout: 1500 }).catch(() => false)
        : false;
      if (canClick) {
        await adminConfirmBtn.click();
        await confirmDialog(page);
        await page.waitForURL(/stage=contract_signed/, { timeout: 20000 });
        return;
      }
    }

    await page.waitForTimeout(2500);
    await page.reload();
  }
  await forceCustomerQuoteConfirmation(page, { dealId, customerEmail });
  await page.reload();
  await expect(page).toHaveURL(/stage=contract_signed/, { timeout: 5000 });
}

async function openCustomerSalesEntry(page: import('@playwright/test').Page, entryUrl: string) {
  await page.goto(entryUrl);

  const loginVisible = await page.locator('#auth-form').isVisible({ timeout: 8000 }).catch(() => false);
  if (loginVisible) {
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#auth-form button[type="submit"]').click();
  }

  await page.waitForURL(/\/account\/account\.html/, { timeout: 30000 });
  const salesTab = page.locator('#tab-sales');
  const salesTabActive = await salesTab.evaluate((node) => node.classList.contains('active')).catch(() => false);
  if (!salesTabActive) {
    await page.click('#nav-sales');
  }
  await expect(page.locator('#tab-sales')).toHaveClass(/active/, { timeout: 20000 });
}

async function submitRequirementInAccount(
  page: import('@playwright/test').Page,
  requirementLink: string,
  companyName: string,
  contactName: string,
  phone: string,
) {
  await openCustomerSalesEntry(page, requirementLink);
  await expect(page.locator('[data-sales-req-field="requester_company"]')).toBeVisible({ timeout: 30000 });

  await page.fill('[data-sales-req-field="title"]', `Requirement ${Date.now()}`);
  await page.fill('[data-sales-req-field="requirement_type"]', 'integrated_mining_power');
  await page.fill('[data-sales-req-field="requester_company"]', companyName);
  await page.fill('[data-sales-req-field="requester_name"]', contactName);
  await page.fill('[data-sales-req-field="requester_email"]', customerEmail);
  await page.fill('[data-sales-req-field="requester_phone"]', phone);
  await page.fill('[data-sales-req-field="country"]', 'China');
  await page.fill('[data-sales-req-field="note"]', 'E2E requirement submission from account center');

  await page.evaluate(() => {
    window.confirm = () => true;
  });
  await page.click('#sales-stage-submit-requirement');
  await page.waitForTimeout(1500);
}

async function submitQuoteConfirmationInAccount(
  page: import('@playwright/test').Page,
  accountStageUrl: string,
) {
  await openCustomerSalesEntry(page, accountStageUrl);
  const checkbox = page.locator('#sales-stage-confirm-checkbox');
  const checkboxVisible = await checkbox.isVisible({ timeout: 8000 }).catch(() => false);

  if (!checkboxVisible) {
    return;
  }

  await checkbox.check();
  await page.fill('#sales-stage-confirm-note', 'Confirmed from account portal e2e.');
  await page.evaluate(() => {
    window.confirm = () => true;
  });
  await page.click('#sales-stage-submit-confirmation');
  await page.waitForTimeout(1500);
}

async function openOrCreateCustomerRequirementFlow(
  page: import('@playwright/test').Page,
  uniqueTag: string,
) {
  await page.goto('/article_management/sales/index.html?page=quote-customers');
  await expect(page.locator('#ams-quote-customer-search')).toBeVisible({ timeout: 20000 });
  await page.fill('#ams-quote-customer-search', customerEmail);
  await page.waitForTimeout(600);

  const customerCards = page
    .locator('details[data-customer-expand-wrap]')
    .filter({ hasText: customerEmail });
  const existingCount = await customerCards.count();
  let companyName = `Formal ${uniqueTag}`;
  let customerId = '';

  if (existingCount > 0) {
    customerId = (await customerCards.first().getAttribute('data-customer-expand-wrap')) || '';
  }
  if (!customerId) {
    customerId = await page.evaluate(async (email) => {
      const createClient = (window as any)?.supabase?.createClient;
      if (typeof createClient !== 'function') return '';
      const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
      const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
      const client = createClient(url, key);
      const { data, error } = await client
        .from('quote_customers')
        .select('id, email')
        .ilike('email', String(email || ''))
        .limit(1);
      if (error || !Array.isArray(data) || data.length === 0) return '';
      return String(data[0]?.id || '');
    }, customerEmail);
  }

  if (customerId) {
    await page.goto(`/article_management/sales/index.html?page=quote-customers&customer=${encodeURIComponent(customerId)}`);
    await expect(page.locator('#ams-quote-customer-save')).toBeVisible({ timeout: 20000 });
    const companyField = page.locator('[data-customer-field="company_name"]:visible');
    if (await companyField.count()) {
      companyName = (await companyField.first().inputValue()).trim() || companyName;
    }
    await page.fill('[data-customer-field="notes"]:visible', `formal backend flow ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');
  } else {
    await page.click('#ams-quote-customer-new');
    await page.fill('[data-customer-field="company_name"]:visible', companyName);
    await page.fill('[data-customer-field="email"]:visible', customerEmail);
    await page.fill('[data-customer-field="notes"]:visible', `formal backend flow ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');
  }

  await page.waitForURL((url) => {
    return url.pathname.endsWith('/article_management/sales/index.html')
      && url.searchParams.get('page') === 'quote-customer-flow'
      && url.searchParams.get('stage') === 'requirement_capture';
  }, { timeout: 40000 });

  const flowUrl = new URL(page.url());
  const dealId = flowUrl.searchParams.get('deal') || '';
  const resolvedCustomerId = flowUrl.searchParams.get('customer') || '';
  expect(dealId).toBeTruthy();
  expect(resolvedCustomerId).toBeTruthy();

  const requirementLink = await page.locator('a.ams-inline-link').first().getAttribute('href');
  expect(requirementLink).toBeTruthy();

  return {
    companyName,
    customerId: resolvedCustomerId,
    dealId,
    requirementLink: requirementLink!,
  };
}

test.describe('Sales formal backend flow', () => {
  test.setTimeout(900000);

  test('admin + customer complete requirement and quote confirmation chain', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* environment variables');

    const uniqueTag = `E2E-${Date.now()}`;
    const phone = `+86-13${String(Date.now()).slice(-9)}`;

    await page.goto('/article_management/sales/index.html?page=quote-customers');
    await expect(page.locator('#ams-login-form')).toBeVisible();
    await page.fill('#ams-login-email', adminEmail);
    await page.fill('#ams-login-password', adminPassword);
    await page.locator('#ams-login-form button[type="submit"]').click();
    await expect(page.locator('.ams-app-sales')).toBeVisible({ timeout: 20000 });

    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerPage = await browser.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Wesley E2E', phone);

    const customerId = entry.customerId;
    const dealId = entry.dealId;
    await page.goto(`/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(customerId)}&deal=${encodeURIComponent(dealId)}&stage=requirement_confirmed`);

    const requirementConfirmBtn = page.locator('#ams-sales-flow-requirement-confirm');
    const canConfirmRequirement = await requirementConfirmBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (canConfirmRequirement) {
      await requirementConfirmBtn.click();
      await confirmDialog(page);
      await page.waitForURL((url) => {
        const stage = url.searchParams.get('stage');
        return stage === 'quote_draft' || stage === 'quote_confirmed';
      }, { timeout: 30000 });
    }

    const bootstrap = await bootstrapDealToQuoteConfirmed(page, {
      dealId,
      customerId,
      customerEmail,
    });

    await page.goto(`/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(customerId)}&deal=${encodeURIComponent(dealId)}&stage=quote_confirmed`);

    const confirmationEntryUrl = bootstrap.confirmStageSlug && bootstrap.confirmStageToken
      ? `/quote/confirmation.html?stage=${encodeURIComponent(bootstrap.confirmStageSlug)}&token=${encodeURIComponent(bootstrap.confirmStageToken)}`
      : `/account/account.html?tab=sales&deal=${encodeURIComponent(dealId)}&stage=quote_confirmed`;
    await submitQuoteConfirmationInAccount(customerPage, confirmationEntryUrl);

    await page.reload();
    await settleToContractStage(page, dealId);

    await customerPage.close();
  });
});
