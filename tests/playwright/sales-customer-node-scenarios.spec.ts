import { expect, test } from '@playwright/test';
import { bootstrapDealToQuoteConfirmed } from './helpers/sales-quote-bootstrap';

const adminEmail = process.env.GX_ADMIN_EMAIL || '';
const adminPassword = process.env.GX_ADMIN_PASSWORD || '';
const customerEmail = process.env.GX_CUSTOMER_EMAIL || '';
const customerPassword = process.env.GX_CUSTOMER_PASSWORD || '';
const unlinkedCustomerEmail = process.env.GX_UNLINKED_CUSTOMER_EMAIL || '';
const unlinkedCustomerPassword = process.env.GX_UNLINKED_CUSTOMER_PASSWORD || '';

function mustHaveCreds() {
  return Boolean(adminEmail && adminPassword && customerEmail && customerPassword);
}

async function setDealCurrentStage(
  page: import('@playwright/test').Page,
  params: {
    dealId: string;
    currentStage: 'contract_signed' | 'factory_accepted' | 'balance_confirmed' | 'deployment_completed' | 'support_active';
    ownerEmail?: string;
  },
) {
  await page.evaluate(async ({ dealId, currentStage, ownerEmailFallback }) => {
    const text = (value: unknown, fallback = '') => {
      const normalized = value == null ? '' : String(value).trim();
      return normalized || fallback;
    };
    const createClient = (window as any)?.supabase?.createClient;
    if (typeof createClient !== 'function') {
      throw new Error('Supabase client unavailable in page context.');
    }
    const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
    const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
    const client = createClient(url, key);
    const now = new Date().toISOString();
    const completedBase = ['customer_profile', 'requirement_capture', 'requirement_confirmed', 'quote_draft', 'quote_confirmed'];
    const completedStages = currentStage === 'support_active'
      ? [...completedBase, 'contract_signed', 'deposit_paid', 'production_scheduled', 'factory_accepted', 'balance_confirmed', 'shipping_in_transit', 'deployment_completed']
      : currentStage === 'deployment_completed'
        ? [...completedBase, 'contract_signed', 'deposit_paid', 'production_scheduled', 'factory_accepted', 'balance_confirmed', 'shipping_in_transit']
        : currentStage === 'balance_confirmed'
          ? [...completedBase, 'contract_signed', 'deposit_paid', 'production_scheduled', 'factory_accepted']
          : currentStage === 'factory_accepted'
            ? [...completedBase, 'contract_signed', 'deposit_paid', 'production_scheduled']
            : completedBase;
    const activeStage = currentStage;

    const { data: dealRows, error: dealError } = await client
      .from('quote_deals')
      .select('owner_name, owner_email')
      .eq('id', dealId)
      .limit(1);
    if (dealError) throw dealError;
    const ownerName = text(dealRows?.[0]?.owner_name, 'sales');
    const ownerEmail = text(dealRows?.[0]?.owner_email, ownerEmailFallback);

    const stageRows = [
      ...completedStages.map((stageKey) => ({
        deal_id: dealId,
        stage_key: stageKey,
        stage_status: 'completed',
        owner_name: ownerName,
        owner_email: ownerEmail,
        completed_at: now,
        meta: {},
      })),
      {
        deal_id: dealId,
        stage_key: activeStage,
        stage_status: 'active',
        owner_name: ownerName,
        owner_email: ownerEmail,
        completed_at: null,
        meta: {},
      },
    ];

    const deduped = stageRows.filter((row, index, rows) => {
      return rows.findIndex((candidate) => candidate.stage_key === row.stage_key) === index;
    });

    const { error: stageError } = await client
      .from('quote_deal_stage_records')
      .upsert(deduped, { onConflict: 'deal_id,stage_key' });
    if (stageError) throw stageError;

    const { error: dealUpdateError } = await client
      .from('quote_deals')
      .update({ current_stage: activeStage })
      .eq('id', dealId);
    if (dealUpdateError) throw dealUpdateError;
  }, {
    dealId: params.dealId,
    currentStage: params.currentStage,
    ownerEmailFallback: params.ownerEmail || adminEmail,
  });
}

async function ensureFieldValue(
  page: import('@playwright/test').Page,
  selector: string,
  value: string,
) {
  const field = page.locator(selector);
  await field.click();
  await field.fill(value);
  if ((await field.inputValue()) === value) return;
  await field.evaluate((node, nextValue) => {
    const input = node as HTMLInputElement | HTMLTextAreaElement;
    input.value = String(nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }, value);
}

async function openCustomerSalesEntry(page: import('@playwright/test').Page, entryUrl: string) {
  const sourceUrl = new URL(entryUrl, 'http://127.0.0.1:4173');
  const canonicalSalesUrl = new URL('/account/sales.html', sourceUrl.origin);
  if (sourceUrl.searchParams.get('req')) {
    canonicalSalesUrl.searchParams.set('req', sourceUrl.searchParams.get('req') || '');
    canonicalSalesUrl.searchParams.set('req_token', sourceUrl.searchParams.get('token') || '');
  }
  if (sourceUrl.searchParams.get('confirm_stage')) {
    canonicalSalesUrl.searchParams.set('confirm_stage', sourceUrl.searchParams.get('confirm_stage') || '');
    canonicalSalesUrl.searchParams.set('confirm_token', sourceUrl.searchParams.get('confirm_token') || sourceUrl.searchParams.get('token') || '');
  }
  if (sourceUrl.searchParams.get('quote')) {
    canonicalSalesUrl.searchParams.set('quote', sourceUrl.searchParams.get('quote') || '');
  }

  await page.goto(entryUrl);
  await page.waitForURL((url) => {
    return url.pathname.endsWith('/account/sales.html')
      || url.pathname.endsWith('/account/account.html')
      || url.pathname.endsWith('/account/user.html');
  }, { timeout: 30000 });

  if (new URL(page.url()).pathname.endsWith('/account/user.html')) {
    await expect(page.locator('#auth-form')).toBeVisible({ timeout: 15000 });
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#auth-form button[type="submit"]').click();
    await page.waitForURL((url) => {
      return url.pathname.endsWith('/account/sales.html')
        || url.pathname.endsWith('/account/account.html');
    }, { timeout: 30000 });
  }

  if ([...canonicalSalesUrl.searchParams.keys()].length > 0) {
    await page.goto(`${canonicalSalesUrl.pathname}${canonicalSalesUrl.search}`);
  }

  await expect(page.locator('#sales-pipeline-root')).toBeVisible({ timeout: 20000 });
}

async function signIntoAccount(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/account/user.html');
  await expect(page.locator('#auth-form')).toBeVisible({ timeout: 20000 });
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.locator('#submit-btn').click();
  await page.waitForURL((url) => !url.pathname.endsWith('/account/user.html'), { timeout: 30000 });
}

async function ensureAdminConsoleReady(page: import('@playwright/test').Page) {
  const loginOnce = async () => {
    await expect(page.locator('#ams-login-form')).toBeVisible({ timeout: 10000 });
    await page.fill('#ams-login-email', adminEmail);
    await page.fill('#ams-login-password', adminPassword);
    await expect(page.locator('#ams-login-email')).toHaveValue(adminEmail);
    await expect(page.locator('#ams-login-password')).toHaveValue(adminPassword);
    const submitButton = page.locator('#ams-login-form button[type="submit"]');
    const buttonLoading = await submitButton.evaluate((node) => {
      return node instanceof HTMLButtonElement && (node.disabled || node.dataset.loading === '1');
    }).catch(() => false);
    if (!buttonLoading) {
      await submitButton.click();
    }
    await page.waitForFunction(() => {
      return Boolean(
        document.querySelector('.ams-app-sales')
        || document.querySelector('#ams-entry-signout')
        || (
          document.querySelector('#ams-login-form button[type="submit"]')
          && !(document.querySelector('#ams-login-form button[type="submit"]') as HTMLButtonElement).disabled
        ),
      );
    }, { timeout: 30000 });
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

async function waitForSalesAppReady(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const loadingText = document.body?.innerText || '';
    const appVisible = Boolean(document.querySelector('.ams-app-sales'));
    return appVisible && !loadingText.includes('销售总览整理中') && !loadingText.includes('正在准备当前页面所需的客户、流程和报价数据');
  }, { timeout: 30000 });
}

async function openOrCreateCustomerRequirementFlow(
  page: import('@playwright/test').Page,
  uniqueTag: string,
) {
  await page.goto('/article_management/sales/index.html?page=quote-customers');
  await waitForSalesAppReady(page).catch(() => {});
  const searchInput = page.locator('#ams-quote-customer-search');
  const searchVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
  if (!searchVisible) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForSalesAppReady(page).catch(() => {});
  }
  await expect(searchInput).toBeVisible({ timeout: 20000 });
  await page.fill('#ams-quote-customer-search', customerEmail);
  await page.waitForTimeout(600);

  const customerCards = page
    .locator('details[data-customer-expand-wrap]')
    .filter({ hasText: customerEmail });
  const existingCount = await customerCards.count();
  let companyName = `Scenario ${uniqueTag}`;
  let customerId = '';

  if (existingCount > 0) {
    customerId = (await customerCards.first().getAttribute('data-customer-expand-wrap')) || '';
  }
  if (customerId) {
    await page.goto(`/article_management/sales/index.html?page=quote-customers&customer=${encodeURIComponent(customerId)}`);
    await waitForSalesAppReady(page);
    await expect(page.locator('#ams-quote-customer-save')).toBeVisible({ timeout: 20000 });
    const companyField = page.locator('[data-customer-field="company_name"]:visible');
    if (await companyField.count()) {
      companyName = (await companyField.first().inputValue()).trim() || companyName;
    }
    await page.fill('[data-customer-field="notes"]:visible', `customer scenario ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');
  } else {
    await waitForSalesAppReady(page);
    await page.click('#ams-quote-customer-new');
    await page.fill('[data-customer-field="company_name"]:visible', companyName);
    await page.fill('[data-customer-field="email"]:visible', customerEmail);
    await page.fill('[data-customer-field="notes"]:visible', `customer scenario ${uniqueTag}`);
    await page.click('#ams-quote-customer-save');
  }

  await page.waitForURL((url) => {
    return url.searchParams.get('page') === 'quote-customer-flow'
      && url.searchParams.get('stage') === 'requirement_capture';
  }, { timeout: 40000 });

  const flowUrl = new URL(page.url());
  const dealId = flowUrl.searchParams.get('deal') || '';
  const resolvedCustomerId = flowUrl.searchParams.get('customer') || '';
  expect(dealId).toBeTruthy();
  expect(resolvedCustomerId).toBeTruthy();

  const requirementLink = await page
    .locator('a.ams-inline-link[href*="/quote/requirement.html"]')
    .first()
    .getAttribute('href');
  expect(requirementLink).toBeTruthy();

  return {
    companyName,
    customerId: resolvedCustomerId,
    dealId,
    requirementLink: requirementLink!,
  };
}

async function submitRequirementInAccount(
  page: import('@playwright/test').Page,
  requirementLink: string,
  companyName: string,
  contactName: string,
  phone: string,
) {
  await page.goto('/account/user.html');
  const accountHomeVisible = await page.locator('a[href="/account/sales.html"].active, a[href="/account/sales.html"]').first().isVisible({ timeout: 5000 }).catch(() => false);
  if (!accountHomeVisible) {
    await expect(page.locator('#auth-form')).toBeVisible({ timeout: 15000 });
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#submit-btn').click();
    await Promise.race([
      page.waitForURL((url) => url.pathname.endsWith('/account/account.html') || url.pathname.endsWith('/account/sales.html'), { timeout: 45000 }),
      page.locator('#auth-form').waitFor({ state: 'hidden', timeout: 45000 }),
    ]);
  }

  await openCustomerSalesEntry(page, requirementLink);
  await expect(page.locator('[data-sales-req-field="requester_company"]')).toBeVisible({ timeout: 30000 });
  const currentCompany = await page.locator('[data-sales-req-field="requester_company"]').inputValue();
  const currentName = await page.locator('[data-sales-req-field="requester_name"]').inputValue();
  const currentEmail = await page.locator('[data-sales-req-field="requester_email"]').inputValue();
  await page.locator('[data-sales-req-field="title"]').fill(`Scenario Requirement ${Date.now()}`);
  await page.locator('[data-sales-req-field="requirement_type"]').fill('integrated_mining_power');
  if (!currentCompany.trim()) {
    await page.locator('[data-sales-req-field="requester_company"]').fill(companyName);
  }
  if (!currentName.trim()) {
    await page.locator('[data-sales-req-field="requester_name"]').fill(contactName);
  }
  if (!currentEmail.trim()) {
    await page.locator('[data-sales-req-field="requester_email"]').fill(customerEmail);
  }
  await ensureFieldValue(page, '[data-sales-req-field="requester_phone"]', phone);
  await ensureFieldValue(page, '[data-sales-req-field="country"]', 'China');
  await page.locator('[data-sales-req-field="note"]').fill('Customer node scenario submission');
  await expect(page.locator('[data-sales-req-field="requester_company"]')).not.toHaveValue('');
  await expect(page.locator('[data-sales-req-field="requester_name"]')).not.toHaveValue('');
  await expect(page.locator('[data-sales-req-field="requester_email"]')).not.toHaveValue('');
  page.once('dialog', (dialog) => { void dialog.accept(); });
  await page.click('#sales-stage-submit-requirement');
  await page.waitForTimeout(2000);
}

test.describe('Sales customer node scenarios', () => {
  test.setTimeout(900000);

  test('unlinked signed-in user sees unmatched sales hint', async ({ page }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');
    test.skip(!unlinkedCustomerEmail || !unlinkedCustomerPassword, 'Missing GX_UNLINKED_CUSTOMER_* credentials for isolated unmatched-account coverage');

    await signIntoAccount(page, unlinkedCustomerEmail, unlinkedCustomerPassword);
    await page.goto('/account/sales.html');
    await expect(page.locator('#sales-pipeline-root')).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/杩樻湭鍖归厤瀹㈡埛閿€鍞嚎|not linked to a customer deal/i)).toBeVisible({ timeout: 15000 });
    await expect(page.locator('[data-sales-req-field="requester_company"]')).toHaveCount(0);
  });

  test('requirement node handles signed-out entry and becomes read-only after submission', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `REQ-SCN-${Date.now()}`;
    const phone = `+86-18${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Scenario Customer', phone);

    await customerPage.goto(entry.requirementLink);
    await expect(customerPage.locator('#sales-pipeline-root')).toBeVisible({ timeout: 20000 });
    await expect(customerPage.locator('#sales-stage-submit-requirement')).toHaveCount(0);
    await customerContext.close();
  });

  test('quote confirmation node covers out-of-turn, missing-check, completion revisit, and invalid link', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `QUOTE-SCN-${Date.now()}`;
    const phone = `+86-17${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Scenario Quote Customer', phone);

    await bootstrapDealToQuoteConfirmed(page, {
      dealId: entry.dealId,
      customerId: entry.customerId,
      customerEmail,
    });

    const quoteStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=quote_confirmed`;
    const futureStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=contract_signed`;

    await openCustomerSalesEntry(customerPage, futureStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
    await expect(customerPage.getByText(/鍘嗗彶\/鏈潵鑺傜偣|past\/future stage/i)).toBeVisible({ timeout: 15000 });

    await openCustomerSalesEntry(customerPage, quoteStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toBeVisible({ timeout: 15000 });
    await customerPage.click('#sales-stage-submit-confirmation');
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toBeVisible({ timeout: 10000 });
    await expect(customerPage.locator('#sales-stage-confirm-checkbox')).not.toBeChecked();

    await customerPage.check('#sales-stage-confirm-checkbox');
    await customerPage.fill('#sales-stage-confirm-note', 'Scenario confirmation');
    customerPage.once('dialog', (dialog) => {
      void dialog.accept().catch(() => {});
    });
    await customerPage.click('#sales-stage-submit-confirmation');
    await customerPage.waitForTimeout(2000);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0, { timeout: 15000 });

    await customerPage.goto(quoteStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
    await expect(customerPage.getByText(/鍘嗗彶\/鏈潵鑺傜偣|past\/future stage/i)).toBeVisible({ timeout: 15000 });

    const invalidUrl = `${entry.requirementLink}x-invalid`;
    const outsiderContext = await browser.newContext();
    const outsiderPage = await outsiderContext.newPage();
    await signIntoAccount(outsiderPage, adminEmail, adminPassword);
    await outsiderPage.goto(invalidUrl);
    await expect(outsiderPage.locator('#sales-pipeline-root')).toBeVisible({ timeout: 20000 });
    await expect(outsiderPage.locator('[data-sales-req-field="requester_company"]')).toHaveCount(0);
    await expect(outsiderPage.getByText(/杩樻湭鍖归厤瀹㈡埛閿€鍞嚎|not linked to a customer deal/i)).toBeVisible({ timeout: 15000 });

    await outsiderContext.close();
    await customerContext.close();
  });

  test('contract confirmation node covers out-of-turn, missing-check, success, and revisit', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `CONTRACT-SCN-${Date.now()}`;
    const phone = `+86-16${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Scenario Contract Customer', phone);

    await bootstrapDealToQuoteConfirmed(page, {
      dealId: entry.dealId,
      customerId: entry.customerId,
      customerEmail,
    });
    await setDealCurrentStage(page, {
      dealId: entry.dealId,
      currentStage: 'contract_signed',
    });

    const currentStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=contract_signed`;
    const futureStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=factory_accepted`;

    await openCustomerSalesEntry(customerPage, futureStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
    await expect(customerPage.getByText(/历史\/未来节点|past\/future stage/i)).toBeVisible({ timeout: 15000 });

    await openCustomerSalesEntry(customerPage, currentStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toBeVisible({ timeout: 15000 });
    await customerPage.click('#sales-stage-submit-confirmation');
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toBeVisible({ timeout: 10000 });
    await expect(customerPage.locator('#sales-stage-confirm-checkbox')).not.toBeChecked();

    await customerPage.check('#sales-stage-confirm-checkbox');
    await customerPage.fill('#sales-stage-confirm-note', 'Scenario contract confirmation');
    customerPage.once('dialog', (dialog) => {
      void dialog.accept().catch(() => {});
    });
    await customerPage.click('#sales-stage-submit-confirmation');
    await customerPage.waitForTimeout(2000);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0, { timeout: 15000 });

    await customerPage.goto(currentStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
    await expect(customerPage.getByText(/历史\/未来节点|past\/future stage/i)).toBeVisible({ timeout: 15000 });

    await customerContext.close();
  });

  test('factory acceptance node covers out-of-turn, missing-check, success, and revisit', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `FAT-SCN-${Date.now()}`;
    const phone = `+86-15${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Scenario FAT Customer', phone);

    await bootstrapDealToQuoteConfirmed(page, {
      dealId: entry.dealId,
      customerId: entry.customerId,
      customerEmail,
    });
    await setDealCurrentStage(page, {
      dealId: entry.dealId,
      currentStage: 'factory_accepted',
    });

    const currentStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=factory_accepted`;
    const futureStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=balance_confirmed`;

    await openCustomerSalesEntry(customerPage, futureStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
    await expect(customerPage.getByText(/历史\/未来节点|past\/future stage/i)).toBeVisible({ timeout: 15000 });

    await openCustomerSalesEntry(customerPage, currentStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toBeVisible({ timeout: 15000 });
    await customerPage.click('#sales-stage-submit-confirmation');
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toBeVisible({ timeout: 10000 });
    await expect(customerPage.locator('#sales-stage-confirm-checkbox')).not.toBeChecked();

    await customerPage.check('#sales-stage-confirm-checkbox');
    await customerPage.fill('#sales-stage-confirm-note', 'Scenario factory acceptance confirmation');
    customerPage.once('dialog', (dialog) => {
      void dialog.accept().catch(() => {});
    });
    await customerPage.click('#sales-stage-submit-confirmation');
    await customerPage.waitForTimeout(2000);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0, { timeout: 15000 });

    await customerPage.goto(currentStageUrl);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
    await expect(customerPage.getByText(/历史\/未来节点|past\/future stage/i)).toBeVisible({ timeout: 15000 });

    await customerContext.close();
  });

  test('late readonly customer stages stay non-actionable after execution handoff', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `LATE-SCN-${Date.now()}`;
    const phone = `+86-14${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Scenario Late Customer', phone);

    await bootstrapDealToQuoteConfirmed(page, {
      dealId: entry.dealId,
      customerId: entry.customerId,
      customerEmail,
    });

    const readonlyStages: Array<{
      currentStage: 'balance_confirmed' | 'deployment_completed' | 'support_active';
      futureStage: string;
    }> = [
      { currentStage: 'balance_confirmed', futureStage: 'shipping_in_transit' },
      { currentStage: 'deployment_completed', futureStage: 'support_active' },
      { currentStage: 'support_active', futureStage: 'support_active' },
    ];

    for (const item of readonlyStages) {
      await setDealCurrentStage(page, {
        dealId: entry.dealId,
        currentStage: item.currentStage,
      });

      const currentStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=${encodeURIComponent(item.currentStage)}`;
      const futureStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=${encodeURIComponent(item.futureStage)}`;

      await openCustomerSalesEntry(customerPage, currentStageUrl);
      await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
      await expect(customerPage.locator('#sales-stage-submit-requirement')).toHaveCount(0);
      await expect(customerPage.getByText(/当前无需操作|no action required now/i)).toBeVisible({ timeout: 15000 });

      if (item.futureStage !== item.currentStage) {
        await openCustomerSalesEntry(customerPage, futureStageUrl);
        await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);
        await expect(customerPage.getByText(/历史\/未来节点|past\/future stage/i)).toBeVisible({ timeout: 15000 });
      }
    }

    await customerContext.close();
  });

  test('requirement entry stays non-repeatable across two customer tabs', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `REQ-RACE-${Date.now()}`;
    const phoneA = `+86-13${String(Date.now()).slice(-9)}`;
    const phoneB = `+86-12${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerContext = await browser.newContext();
    const tabA = await customerContext.newPage();
    const tabB = await customerContext.newPage();

    await submitRequirementInAccount(tabA, entry.requirementLink, entry.companyName, 'Scenario Race Customer A', phoneA);

    await openCustomerSalesEntry(tabB, entry.requirementLink);
    await expect(tabB.locator('#sales-stage-submit-requirement')).toHaveCount(0, { timeout: 20000 });
    await expect(tabB.locator('#sales-stage-submit-confirmation')).toHaveCount(0);

    await customerContext.close();
  });

  test('quote confirmation cannot be resubmitted after refresh in the same customer session', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `QUOTE-REPEAT-${Date.now()}`;
    const phone = `+86-11${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await submitRequirementInAccount(customerPage, entry.requirementLink, entry.companyName, 'Scenario Repeat Customer', phone);

    await bootstrapDealToQuoteConfirmed(page, {
      dealId: entry.dealId,
      customerId: entry.customerId,
      customerEmail,
    });

    const quoteStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=quote_confirmed`;
    await openCustomerSalesEntry(customerPage, quoteStageUrl);
    await customerPage.check('#sales-stage-confirm-checkbox');
    await customerPage.fill('#sales-stage-confirm-note', 'Scenario repeat confirmation');
    customerPage.once('dialog', (dialog) => {
      void dialog.accept().catch(() => {});
    });
    await customerPage.click('#sales-stage-submit-confirmation');
    await customerPage.waitForTimeout(2000);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0, { timeout: 15000 });

    await customerPage.reload();
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0, { timeout: 15000 });
    await expect(customerPage.getByText(/历史\/未来节点|past\/future stage/i)).toBeVisible({ timeout: 15000 });

    await customerContext.close();
  });

  test('tampered requirement token falls back to unmatched sales state', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `REQ-STALE-${Date.now()}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const tamperedUrl = new URL(entry.requirementLink, 'http://127.0.0.1:4173');
    tamperedUrl.searchParams.set('token', `${tamperedUrl.searchParams.get('token') || 'token'}-tampered`);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();
    await openCustomerSalesEntry(customerPage, tamperedUrl.toString());
    await expect(customerPage.locator('[data-sales-req-field="requester_company"]')).toHaveCount(0);
    await expect(customerPage.locator('#sales-stage-submit-requirement')).toHaveCount(0);
    await expect(customerPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0);

    await customerContext.close();
  });

  test('quote confirmation cannot be replayed from a second browser session after completion', async ({ page, browser }) => {
    test.skip(!mustHaveCreds(), 'Missing GX_ADMIN_* or GX_CUSTOMER_* credentials');

    const uniqueTag = `QUOTE-BROWSER-${Date.now()}`;
    const phone = `+86-10${String(Date.now()).slice(-9)}`;
    await ensureAdminConsoleReady(page);
    const entry = await openOrCreateCustomerRequirementFlow(page, uniqueTag);

    const firstContext = await browser.newContext();
    const firstPage = await firstContext.newPage();
    await submitRequirementInAccount(firstPage, entry.requirementLink, entry.companyName, 'Scenario Browser Customer', phone);

    await bootstrapDealToQuoteConfirmed(page, {
      dealId: entry.dealId,
      customerId: entry.customerId,
      customerEmail,
    });

    const quoteStageUrl = `/account/sales.html?deal=${encodeURIComponent(entry.dealId)}&stage=quote_confirmed`;
    await openCustomerSalesEntry(firstPage, quoteStageUrl);
    await firstPage.check('#sales-stage-confirm-checkbox');
    await firstPage.fill('#sales-stage-confirm-note', 'Scenario first browser confirmation');
    firstPage.once('dialog', (dialog) => {
      void dialog.accept().catch(() => {});
    });
    await firstPage.click('#sales-stage-submit-confirmation');
    await firstPage.waitForTimeout(2000);
    await expect(firstPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0, { timeout: 15000 });

    const secondContext = await browser.newContext();
    const secondPage = await secondContext.newPage();
    await openCustomerSalesEntry(secondPage, quoteStageUrl);
    await expect(secondPage.locator('#sales-stage-submit-confirmation')).toHaveCount(0, { timeout: 15000 });

    await secondContext.close();
    await firstContext.close();
  });
});
