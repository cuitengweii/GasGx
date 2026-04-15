import { expect, test } from '@playwright/test';
import { bootstrapDealToQuoteConfirmed } from './helpers/sales-quote-bootstrap';

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

function usesSharedDevIdentity() {
  return Boolean(
    adminEmail
    && customerEmail
    && adminPassword
    && customerPassword
    && adminEmail === customerEmail
    && adminPassword === customerPassword,
  );
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
    await submit.click({ force: true, noWaitAfter: true, timeout: 8000 });
  } catch (_error) {
    await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('[data-sales-confirm-submit]'));
      const node = list[list.length - 1] as HTMLButtonElement | undefined;
      node?.click();
    });
  }
}

async function openCustomerSalesEntry(page: import('@playwright/test').Page, entryUrl: string) {
  await page.goto(entryUrl);

  const loginVisible = await page.locator('#auth-form').isVisible({ timeout: 8000 }).catch(() => false);
  if (loginVisible) {
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#auth-form button[type="submit"]').click();
  }

  await page.waitForURL((url) => url.pathname.endsWith('/account/sales.html'), { timeout: 30000 });
  await expect(page.locator('#sales-pipeline-root')).toBeVisible({ timeout: 20000 });
}

async function ensureAdminConsoleReady(page: import('@playwright/test').Page) {
  const loginOnce = async () => {
    await expect(page.locator('#ams-login-form')).toBeVisible({ timeout: 10000 });
    await page.fill('#ams-login-email', adminEmail);
    await page.fill('#ams-login-password', adminPassword);
    await expect(page.locator('#ams-login-email')).toHaveValue(adminEmail);
    await expect(page.locator('#ams-login-password')).toHaveValue(adminPassword);
    await page.locator('#ams-login-form button[type="submit"]').click();
  };

  await page.goto('/article_management/sales/index.html?page=quote-customers');

  const waitForConsoleEntry = async () => {
    await page.waitForFunction(() => {
      return Boolean(
        document.querySelector('#ams-login-form')
        || document.querySelector('.ams-app-sales')
        || document.querySelector('#ams-entry-signout'),
      );
    }, { timeout: 20000 });
  };

  await waitForConsoleEntry();
  const loginVisible = await page.locator('#ams-login-form').isVisible({ timeout: 5000 }).catch(() => false);
  if (loginVisible) {
    await loginOnce();
  }

  const shellVisible = await page.locator('.ams-app-sales').isVisible({ timeout: 20000 }).catch(() => false);
  if (shellVisible) return;

  const deniedVisible = await page.locator('#ams-entry-signout').isVisible({ timeout: 3000 }).catch(() => false);
  if (deniedVisible) {
    throw new Error('Admin console entry is denied for the provided GX_ADMIN_* credentials.');
  }

  const startupVisible = await page.locator('.ams-loading').isVisible({ timeout: 1000 }).catch(() => false);
  if (startupVisible) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForConsoleEntry();
  }

  const secondLoginVisible = await page.locator('#ams-login-form').isVisible({ timeout: 3000 }).catch(() => false);
  if (secondLoginVisible) {
    await loginOnce();
  }

  const timeoutToastVisible = await page.getByText('Loading admin access timed out. Please check connectivity to Supabase.').isVisible({ timeout: 2000 }).catch(() => false);
  if (timeoutToastVisible && await page.locator('#ams-login-form').isVisible({ timeout: 2000 }).catch(() => false)) {
    await loginOnce();
  }

  await expect(page.locator('.ams-app-sales')).toBeVisible({ timeout: 20000 });
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

async function ensureQuoteConfirmedGuardState(
  page: import('@playwright/test').Page,
  params: { dealId: string; customerId: string; customerEmail: string },
) {
  try {
    await Promise.race([
      bootstrapDealToQuoteConfirmed(page, params),
      new Promise((_, reject) => setTimeout(() => reject(new Error('bootstrap-timeout')), 90000)),
    ]);
    return;
  } catch (_error) {
    await page.evaluate(async ({ dealId, customerId, customerEmail }) => {
      const text = (value: unknown, fallback = '') => {
        const normalized = value == null ? '' : String(value).trim();
        return normalized || fallback;
      };
      const createClient = (window as any)?.supabase?.createClient;
      if (typeof createClient !== 'function') throw new Error('Supabase client unavailable in page context.');
      const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
      const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
      const client = createClient(url, key);
      const now = new Date().toISOString();

      const { data: dealRows, error: dealError } = await client
        .from('quote_deals')
        .select('id, customer_id, owner_name, owner_email, primary_instance_id')
        .eq('id', dealId)
        .limit(1);
      if (dealError || !Array.isArray(dealRows) || !dealRows.length) {
        throw new Error(`Load deal failed: ${dealError?.message || 'deal missing'}`);
      }
      const deal = dealRows[0];

      let instanceId = text(deal.primary_instance_id);
      if (!instanceId) {
        const { data: instances, error: instanceError } = await client
          .from('quote_instances')
          .select('id')
          .eq('deal_id', dealId)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (instanceError) throw instanceError;
        instanceId = text(instances?.[0]?.id);
      }
      if (!instanceId) throw new Error('No quote instance found for governance fallback.');

      const ownerName = text(deal.owner_name, 'sales');
      const ownerEmail = text(deal.owner_email, text(customerEmail));
      const stageRows = [
        { deal_id: dealId, stage_key: 'customer_profile', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: now },
        { deal_id: dealId, stage_key: 'requirement_capture', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: now },
        { deal_id: dealId, stage_key: 'requirement_confirmed', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: now },
        { deal_id: dealId, stage_key: 'quote_draft', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: now },
        { deal_id: dealId, stage_key: 'quote_confirmed', stage_status: 'active', owner_name: ownerName, owner_email: ownerEmail, completed_at: null, meta: {} },
      ];
      const { error: stageError } = await client
        .from('quote_deal_stage_records')
        .upsert(stageRows, { onConflict: 'deal_id,stage_key' });
      if (stageError) throw stageError;

      const { error: dealUpdateError } = await client
        .from('quote_deals')
        .update({
          customer_id: text(customerId || deal.customer_id),
          primary_instance_id: instanceId,
          current_stage: 'quote_confirmed',
        })
        .eq('id', dealId);
      if (dealUpdateError) throw dealUpdateError;
    }, params);
  }
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
  await page.fill('[data-sales-req-field="note"]', 'Governance requirement submission via account center');

  page.once('dialog', (dialog) => {
    void dialog.accept();
  });
  await page.click('#sales-stage-submit-requirement');
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
    await page.fill('[data-customer-field="notes"]:visible', `governance guard ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');
  } else {
    await page.click('#ams-quote-customer-new');
    await page.fill('[data-customer-field="company_name"]:visible', companyName);
    await page.fill('[data-customer-field="email"]:visible', customerEmail);
    await page.fill('[data-customer-field="notes"]:visible', `governance guard ${uniqueTag}`);
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

test.describe('Sales governance guards', () => {
  test.setTimeout(900000);

  test('customer account cannot access sales admin console', async ({ page }) => {
    test.skip(!hasCustomerCreds(), 'Missing GX_CUSTOMER_EMAIL or GX_CUSTOMER_PASSWORD');
    test.skip(usesSharedDevIdentity(), 'GX_CUSTOMER_* and GX_ADMIN_* use the same account in dev mode, so role-isolation cannot be asserted.');

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
    test.skip(!(hasAdminCreds() && hasCustomerCreds()), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `E2E-GUARD-${Date.now()}`;
    const phone = `+86-13${String(Date.now()).slice(-9)}`;

    await ensureAdminConsoleReady(page);

    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerPage = await browser.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Flow Guard', phone);

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

    await ensureQuoteConfirmedGuardState(page, {
      dealId,
      customerId,
      customerEmail,
    });

    await openAdminCustomerFlowStage(page, customerId, dealId, 'quote_confirmed');
    const confirmBtn = page.locator('#ams-sales-flow-instance-confirm');
    await expect(confirmBtn).toBeVisible({ timeout: 90000 });
    await expect(confirmBtn).toBeDisabled();

    await customerPage.close();
  });
});
