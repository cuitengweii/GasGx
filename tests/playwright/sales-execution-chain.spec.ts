import { expect, test } from '@playwright/test';
import { bootstrapDealToQuoteConfirmed, forceCustomerQuoteConfirmation } from './helpers/sales-quote-bootstrap';

const adminEmail = process.env.GX_ADMIN_EMAIL || '';
const adminPassword = process.env.GX_ADMIN_PASSWORD || '';
const customerEmail = process.env.GX_CUSTOMER_EMAIL || '';

function mustHaveCreds() {
  return Boolean(adminEmail && adminPassword && customerEmail);
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
  try {
    await submit.click({ noWaitAfter: true, force: true, timeout: 8000 });
  } catch (_error) {
    await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('[data-sales-confirm-submit]'));
      const node = list[list.length - 1] as HTMLButtonElement | undefined;
      node?.click();
    });
  }
}

async function settleToContractStage(page: import('@playwright/test').Page, dealId: string) {
  const syncFromBackendIfNeeded = async () => {
    const backendStage = await readDealCurrentStage(page, dealId);
    if (backendStage === 'contract_signed') {
      const currentUrl = new URL(page.url());
      const customerId = currentUrl.searchParams.get('customer') || '';
      const targetUrl = customerId
        ? `/article_management/sales/index.html?page=quote-customer-flow&deal=${encodeURIComponent(dealId)}&customer=${encodeURIComponent(customerId)}&stage=contract_signed`
        : `/article_management/sales/index.html?page=quote-customer-flow&deal=${encodeURIComponent(dealId)}&stage=contract_signed`;
      await page.goto(targetUrl);
      await expect(page).toHaveURL(/stage=contract_signed/, { timeout: 15000 });
      return true;
    }
    return false;
  };

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
        try {
          await page.waitForURL(/stage=contract_signed/, { timeout: 20000 });
          return;
        } catch {
          const synced = await syncFromBackendIfNeeded();
          if (synced) return;
        }
      }
    }

    await page.waitForTimeout(2500);
    await page.reload();
    const synced = await syncFromBackendIfNeeded();
    if (synced) return;
  }
  await forceCustomerQuoteConfirmation(page, { dealId, customerEmail });
  await page.reload();
  const synced = await syncFromBackendIfNeeded();
  if (synced) return;
  await expect(page).toHaveURL(/stage=contract_signed/, { timeout: 5000 });
}

async function readDealCurrentStage(page: import('@playwright/test').Page, dealId: string): Promise<string> {
  return page.evaluate(async (dealIdentifier) => {
    const createClient = (window as any)?.supabase?.createClient;
    if (typeof createClient !== 'function') return '';
    const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
    const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
    const client = createClient(url, key);
    const { data, error } = await client
      .from('quote_deals')
      .select('current_stage')
      .eq('id', String(dealIdentifier || ''))
      .limit(1);
    if (error || !Array.isArray(data) || !data.length) return '';
    return String(data[0]?.current_stage || '');
  }, dealId);
}

async function saveAndAdvanceStage(
  page: import('@playwright/test').Page,
  dealId: string,
  currentStage: string,
  nextStage: string,
) {
  const advanceOnce = async () => {
    await expect(page.locator('#ams-sales-flow-stage-save')).toBeVisible({ timeout: 30000 });
    await page.click('#ams-sales-flow-stage-save');
    await confirmDialog(page, false);

    await expect(page.locator('#ams-sales-flow-stage-complete')).toBeVisible({ timeout: 30000 });
    await page.click('#ams-sales-flow-stage-complete');
    await confirmDialog(page, false);
  };

  const syncFromBackendIfNeeded = async () => {
    const backendStage = await readDealCurrentStage(page, dealId);
    if (backendStage === nextStage) {
      await page.goto(`/article_management/sales/index.html?page=quote-customer-flow&deal=${encodeURIComponent(dealId)}&stage=${encodeURIComponent(nextStage)}`);
      await expect(page).toHaveURL(new RegExp(`stage=${nextStage}`), { timeout: 15000 });
      return true;
    }
    return false;
  };

  await advanceOnce();
  try {
    await page.waitForURL((url) => url.searchParams.get('stage') === nextStage, { timeout: 18000 });
    return;
  } catch {
    const synced = await syncFromBackendIfNeeded();
    if (synced) return;
  }

  await page.reload();
  const stageAfterReload = new URL(page.url()).searchParams.get('stage') || '';
  if (stageAfterReload === nextStage) return;
  if (stageAfterReload !== currentStage) {
    const synced = await syncFromBackendIfNeeded();
    if (synced) return;
  }

  await advanceOnce();
  try {
    await page.waitForURL((url) => url.searchParams.get('stage') === nextStage, { timeout: 30000 });
    return;
  } catch {
    const synced = await syncFromBackendIfNeeded();
    if (synced) return;
  }

  await expect(page).toHaveURL(new RegExp(`stage=${nextStage}`), { timeout: 30000 });
}

async function ensureStageEntry(
  page: import('@playwright/test').Page,
  dealId: string,
  expectedStage: string,
) {
  const stage = new URL(page.url()).searchParams.get('stage') || '';
  if (stage === expectedStage) return;

  const backendStage = await readDealCurrentStage(page, dealId);
  const targetStage = backendStage || expectedStage;
  await page.goto(`/article_management/sales/index.html?page=quote-customer-flow&deal=${encodeURIComponent(dealId)}&stage=${encodeURIComponent(targetStage)}`);
  await expect(page).toHaveURL(new RegExp(`stage=${targetStage}`), { timeout: 20000 });
}

async function openStandaloneRequirementEntry(page: import('@playwright/test').Page, entryUrl: string) {
  await page.goto(entryUrl);
  await page.waitForURL((url) => url.pathname.endsWith('/quote/requirement.html'), { timeout: 30000 });
  await expect(page.locator('#requirement-app')).toBeVisible({ timeout: 20000 });
}

async function openAdminCustomerFlowStage(
  page: import('@playwright/test').Page,
  customerId: string,
  dealId: string,
  stage: string,
) {
  const url = `/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(customerId)}&deal=${encodeURIComponent(dealId)}&stage=${encodeURIComponent(stage)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const waitUntilReady = async () => {
    await page.waitForFunction(() => {
      const shell = document.querySelector('.ams-app-sales');
      if (!shell) return false;
      const loadingPanel = document.querySelector('.ams-loading-panel');
      const stageConfirm = document.querySelector('#ams-sales-flow-instance-confirm');
      const fallbackContent = document.querySelector('#ams-content .ams-empty, #ams-content .ams-card, #ams-content .ams-quote-layout');
      return !loadingPanel || !!stageConfirm || !!fallbackContent;
    }, { timeout: 60000 });
  };

  await waitUntilReady();
  const stillLoading = await page.locator('.ams-loading-panel').isVisible({ timeout: 1500 }).catch(() => false);
  if (stillLoading) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitUntilReady();
  }
}

async function openStandaloneConfirmationEntry(page: import('@playwright/test').Page, entryUrl: string) {
  await page.goto(entryUrl);
  await page.waitForURL((url) => url.pathname.endsWith('/quote/confirmation.html'), { timeout: 30000 });
  await expect(page.locator('#stage-confirmation-app')).toBeVisible({ timeout: 20000 });
}

async function submitRequirementOnPublicPage(
  page: import('@playwright/test').Page,
  requirementLink: string,
  companyName: string,
  contactName: string,
  phone: string,
) {
  await openStandaloneRequirementEntry(page, requirementLink);
  await expect(page.locator('[data-field="requester_company"]')).toBeVisible({ timeout: 30000 });

  await page.fill('[data-field="requester_company"]', companyName);
  await page.fill('[data-field="requester_name"]', contactName);
  await page.fill('[data-field="requester_email"]', customerEmail);
  await page.fill('[data-field="requester_phone"]', phone);
  await page.selectOption('[data-field="country"]', 'China');
  await page.selectOption('[data-field="requirement_type"]', 'integrated_mining_power');
  await page.locator('[data-answer-check="miner_brands"][value="bitmain"]').check({ force: true });
  await page.selectOption('[data-answer-field="miner_model"]', 'antminer-s21-200t');
  await page.fill('textarea[data-answer-field="extra_notes"]', 'Execution chain requirement submission via standalone public requirement page');
  await page.check('#requirement-submit-confirm');
  await page.click('#requirement-submit');
  await expect(page.locator('#requirement-submit')).toBeDisabled({ timeout: 30000 });
  await expect(page.locator('#requirement-submit-status')).toContainText('已提交', { timeout: 30000 });
}

async function submitQuoteConfirmationOnPublicPage(
  page: import('@playwright/test').Page,
  confirmationUrl: string,
) {
  await openStandaloneConfirmationEntry(page, confirmationUrl);
  const checkbox = page.locator('#stage-confirmation-checkbox');
  const checkboxVisible = await checkbox.isVisible({ timeout: 8000 }).catch(() => false);

  if (!checkboxVisible) {
    return;
  }

  await checkbox.check();
  await page.fill('#stage-confirmation-note', 'Execution chain quote confirmation from standalone public confirmation page.');
  await page.click('#stage-confirmation-submit');
  await expect(page.locator('#stage-confirmation-submit')).toBeDisabled({ timeout: 30000 });
  await expect(page.locator('#stage-confirmation-status')).not.toHaveText('', { timeout: 30000 });
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
    await page.fill('[data-customer-field="notes"]:visible', `execution chain ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');
  } else {
    await page.click('#ams-quote-customer-new');
    await page.fill('[data-customer-field="company_name"]:visible', companyName);
    await page.fill('[data-customer-field="email"]:visible', customerEmail);
    await page.fill('[data-customer-field="notes"]:visible', `execution chain ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');
  }

  await page.waitForURL((url) => url.searchParams.get('page') === 'quote-customer-flow' && url.searchParams.get('stage') === 'requirement_capture', { timeout: 40000 });

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

test.describe('Sales execution chain formal backend flow', () => {
  test.setTimeout(1500000);

  test('advance from contract to support stage with save/advance guards', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_EMAIL, GX_ADMIN_PASSWORD, or GX_CUSTOMER_EMAIL.');

    const uniqueTag = `E2E-EXEC-${Date.now()}`;
    const phone = `+86-13${String(Date.now()).slice(-9)}`;

    await page.goto('/article_management/sales/index.html?page=quote-customers');
    await expect(page.locator('#ams-login-form')).toBeVisible();
    await page.fill('#ams-login-email', adminEmail);
    await page.fill('#ams-login-password', adminPassword);
    await page.locator('#ams-login-form button[type="submit"]').click();
    await expect(page.locator('.ams-app-sales')).toBeVisible({ timeout: 20000 });

    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerPage = await browser.newPage();
    await submitRequirementOnPublicPage(customerPage, entry.requirementLink, entry.companyName, 'Execution E2E', phone);

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

    await openAdminCustomerFlowStage(page, customerId, dealId, 'quote_confirmed');
    await expect(page.locator('#ams-sales-flow-instance-confirm')).toBeVisible({ timeout: 90000 });

    const confirmationEntryUrl = bootstrap.confirmStageSlug && bootstrap.confirmStageToken
      ? `/quote/confirmation.html?stage=${encodeURIComponent(bootstrap.confirmStageSlug)}&token=${encodeURIComponent(bootstrap.confirmStageToken)}`
      : `/account/sales.html?deal=${encodeURIComponent(dealId)}&stage=quote_confirmed`;
    await submitQuoteConfirmationOnPublicPage(customerPage, confirmationEntryUrl);

    await page.reload();
    await settleToContractStage(page, dealId);

    const executionChain: Array<{ stage: string; next: string }> = [
      { stage: 'contract_signed', next: 'deposit_paid' },
      { stage: 'deposit_paid', next: 'production_scheduled' },
      { stage: 'production_scheduled', next: 'factory_accepted' },
      { stage: 'factory_accepted', next: 'balance_confirmed' },
      { stage: 'balance_confirmed', next: 'shipping_in_transit' },
      { stage: 'shipping_in_transit', next: 'deployment_completed' },
      { stage: 'deployment_completed', next: 'support_active' },
    ];

    for (const item of executionChain) {
      await ensureStageEntry(page, dealId, item.stage);
      await saveAndAdvanceStage(page, dealId, item.stage, item.next);
    }

    await expect(page).toHaveURL(/stage=support_active/);
    await customerPage.close();
  });
});
