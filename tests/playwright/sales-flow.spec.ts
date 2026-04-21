import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const adminEmail = process.env.GX_THREAD_ADMIN_EMAIL || process.env.GX_ADMIN_EMAIL || 'sales-thread-admin@gasgx.dev';
const adminPassword = process.env.GX_THREAD_ADMIN_PASSWORD || process.env.GX_ADMIN_PASSWORD || 'CodexThread!2026';
const seededCustomerId = process.env.GX_THREAD_CUSTOMER_ID || '44444444-4444-4444-8444-444444444444';
const seededDealId = process.env.GX_THREAD_DEAL_ID || '55555555-5555-4555-8555-555555555555';

function seededRequirementFlowUrl() {
  return `/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(seededCustomerId)}&deal=${encodeURIComponent(seededDealId)}&stage=requirement_capture`;
}

function seededCustomerFlowStageUrl(stage: string) {
  return `/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(seededCustomerId)}&deal=${encodeURIComponent(seededDealId)}&stage=${encodeURIComponent(stage || 'customer_profile')}`;
}

async function loginSalesAdmin(page: Page) {
  await page.goto('/article_management/sales/index.html', { waitUntil: 'domcontentloaded' });
  const loginForm = page.locator('#ams-login-form');
  const requiresLogin = await loginForm.isVisible({ timeout: 5000 }).catch(() => false);

  if (requiresLogin) {
    await page.fill('#ams-login-email', adminEmail);
    await page.fill('#ams-login-password', adminPassword);
    await page.locator('#ams-login-form button[type="submit"]').click();
  }

  await expect(page.locator('.ams-app-sales')).toBeVisible({ timeout: 30000 });
}

async function waitForCustomerFlowDetail(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.ams-sales-flow-detail-panel')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('[data-sales-flow-detail-tab="communication"]')).toBeVisible({ timeout: 45000 });
}

async function createDetachedCustomer(page: Page, tag: string) {
  return await page.evaluate(async (uniqueTag) => {
    const createClient = (window as any)?.supabase?.createClient;
    if (typeof createClient !== 'function') {
      throw new Error('Supabase client unavailable in page context.');
    }
    const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
    const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
    const client = createClient(url, key);
    const email = `sales-flow-tabs-${String(uniqueTag || '').replace(/[^a-zA-Z0-9-]/g, '')}@gasgx.dev`.toLowerCase();
    const payload = {
      company_name: `Flow Tabs ${uniqueTag}`,
      email,
      phone: '+86 0000 0000',
      country: 'China',
      notes: `Playwright shell test ${uniqueTag}`,
      is_active: true,
      is_deleted: false,
    };
    const { data, error } = await client
      .from('quote_customers')
      .insert(payload)
      .select('id, email')
      .single();
    if (error || !data?.id) {
      throw new Error(error?.message || 'Failed to create detached customer.');
    }
    return {
      id: String(data.id),
      email: String(data.email || email),
    };
  }, tag);
}

async function cleanupDetachedCustomer(page: Page, customerId: string) {
  if (!customerId) return;
  await page.evaluate(async (id) => {
    const createClient = (window as any)?.supabase?.createClient;
    if (typeof createClient !== 'function') return;
    const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
    const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
    const client = createClient(url, key);
    await client
      .from('quote_customers')
      .update({ is_active: false, is_deleted: true })
      .eq('id', String(id || ''));
  }, customerId).catch(() => {});
}

test.describe('Sales console safety checks', () => {
  test('sales dashboard no longer renders the pipeline guide section', async () => {
    const source = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');

    expect(source).not.toContain('<span class="ams-section-kicker">Pipeline guide</span>');
    expect(source).not.toContain('<h3>销售推进池</h3>');
    expect(source).toContain('<section class="ams-card ams-dashboard-todo-panel">');
  });

  test('sales login page renders without runtime exceptions', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/article_management/sales/index.html');
    await expect(page.locator('#ams-login-form')).toBeVisible();

    expect(pageErrors, `page errors: ${pageErrors.join(' | ')}`).toHaveLength(0);
  });

  test('critical save handlers use a single binding path', async () => {
    const source = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');
    const ids = [
      "ams-sales-flow-customer-save')?.addEventListener",
      "ams-sales-flow-requirement-save')?.addEventListener",
      "ams-sales-flow-quote-save')?.addEventListener",
      "ams-sales-flow-stage-save')?.addEventListener",
    ];

    ids.forEach((token) => {
      const hits = source.split(token).length - 1;
      expect(hits, `${token} should be bound exactly once`).toBe(1);
    });

    expect(source).toContain('bindSalesCustomerActions(input, stageKey, customerId, customerFlow);');
    expect(source).toContain('bindSalesRequirementActions(input, stageKey, customerId, customerFlow);');
    expect(source).toContain('bindSalesQuoteActions(input, stageKey, customerId, customerFlow);');
    expect(source).toContain('bindSalesExecutionActions(input, stageKey, customerId, customerFlow);');
  });

  test('sales communication panel keeps threaded comment/reply structure', async () => {
    const source = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');

    expect(source).toContain('function buildStageCommunicationThreads(');
    expect(source).toContain('class="ams-comment-thread-replies"');
    expect(source).toContain('class="ams-comment-thread-row');
    expect(source).toContain('留言 / 回复');
    expect(source).toContain('当前节点对话');
  });

  test('activity read loader batches large quote_activity_reads requests', async () => {
    const source = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');

    expect(source).toContain('const activityReadBatchSize = 120;');
    expect(source).toContain('dedupedIds.slice(start, start + activityReadBatchSize)');
    expect(source).toContain(".in('activity_id', batch)");
  });

  test('customer archive list sorts newest updated customers first', async () => {
    const source = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');

    expect(source).toContain('const rightStamp = text(right.updated_at || right.created_at);');
    expect(source).toContain('const leftStamp = text(left.updated_at || left.created_at);');
    expect(source).toContain('return rightStamp.localeCompare(leftStamp)');
  });

  test('customer archive cards show the latest deal order number as digits only badge', async () => {
    const moduleSource = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');
    const styleSource = readFileSync(resolve(process.cwd(), 'article_management/styles/main.css'), 'utf8');

    expect(moduleSource).toContain('function customerPrimaryDeal(customerId = \'\') {');
    expect(moduleSource).toContain('function numericDealOrderNumber(deal = {}) {');
    expect(moduleSource).toContain('class="ams-sales-customer-order-badge"');
    expect(moduleSource).toContain('return `${prefix}${pad(suffixSeed, 6)}`;');
    expect(moduleSource).toContain('订单号 ${esc(numericDealOrderNumber(primaryDeal))}');
    expect(styleSource).toContain('.ams-sales-customer-order-badge');
  });

  test('customer flow detail shell keeps tabs, embedded history and embedded contacts inside the main panel', async () => {
    const moduleSource = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');
    const styleSource = readFileSync(resolve(process.cwd(), 'article_management/styles/main.css'), 'utf8');

    expect(moduleSource).toContain("salesFlowDetailTab: 'communication'");
    expect(moduleSource).toContain("label: '沟通记录'");
    expect(moduleSource).toContain("label: '节点详情'");
    expect(moduleSource).toContain("label: '全部历史与轨迹'");
    expect(moduleSource).toContain('return salesStageShellMarkup(stage, deal, customer, mainMarkup);');
    expect(moduleSource).toContain('salesStageContactsSectionMarkup(stage.key, deal, { embedded: true })');
    expect(moduleSource).toContain("customerActivityTimelinePanelMarkup(customerId, { embedded: true })");
    expect(moduleSource).toContain('salesCustomerFlowDetailMarkup(stageKey, syncedActiveDeal, moduleState.customerEditor || createCustomerDraft(), customerId, input)');
    expect(moduleSource).toContain('data-stage-comment-focus="${esc(text(entry.reply_to_id))}"');
    expect(moduleSource).toContain("data-sales-flow-tab-panel=");
    expect(moduleSource).toContain("if (customerFlow) {");
    expect(moduleSource).toContain('function bindSalesStageCommentActions(input, stageKey = \'\') {');
    expect(moduleSource).toContain('const syncStageCommentReplyUi = () => {');
    expect(moduleSource).toContain("button.textContent = isActive ? '取消回复' : '回复';");
    expect(styleSource).toContain('.ams-sales-flow-detail-panel');
    expect(styleSource).toContain('.ams-sales-flow-tabbar');
    expect(styleSource).toContain('.ams-stage-comments-card.is-docked');
    expect(styleSource).toContain('.ams-comment-focus-link');
  });
});

test.describe('Sales flow detail tabs', () => {
  test('requirement stage defaults to communication and switches to details/history without losing key actions', async ({ page }) => {
    test.slow();

    await loginSalesAdmin(page);
    await waitForCustomerFlowDetail(page, seededRequirementFlowUrl());
    const originalUrl = page.url();

    await expect(page.locator('[data-sales-flow-active-tab="communication"]')).toBeVisible();
    await expect(page.locator('.ams-stage-comments-card .ams-section-head h3')).toContainText('沟通记录');
    await expect(page.locator('#ams-stage-comment-input')).toBeVisible();

    await page.locator('[data-sales-flow-detail-tab="details"]').click();
    await expect(page.locator('[data-sales-flow-active-tab="details"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-sales-flow-active-tab="details"]')).toContainText('客户填写进度说明');
    await expect(page.locator('#ams-sales-stage-contacts-save')).toBeVisible();
    await expect(page).toHaveURL(originalUrl);

    await page.locator('[data-sales-flow-detail-tab="history"]').click();
    await expect(page.locator('[data-sales-flow-active-tab="history"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-customer-activity-filter="all"]')).toBeVisible();
    await expect(page.locator('.ams-sales-activity-list')).toBeVisible();
    await expect(page).toHaveURL(originalUrl);

    await page.locator('[data-sales-flow-detail-tab="communication"]').click();
    await expect(page.locator('[data-sales-flow-active-tab="communication"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#ams-stage-comment-input')).toBeVisible();
    await expect(page.locator('#ams-sales-flow-requirement-open-link')).toBeVisible();
    await expect(page).toHaveURL(originalUrl);
  });

  test('customer profile stage reuses the same tabs shell before any deal exists', async ({ page }) => {
    test.slow();

    await loginSalesAdmin(page);

    const tag = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const detachedCustomer = await createDetachedCustomer(page, tag);

    try {
      await waitForCustomerFlowDetail(
        page,
        `/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(detachedCustomer.id)}&stage=customer_profile`,
      );

      await expect(page.locator('[data-sales-flow-active-tab="communication"]')).toBeVisible();
      await expect(page.locator('.ams-stage-comments-card')).toContainText('沟通记录');

      await page.locator('[data-sales-flow-detail-tab="details"]').click();
      await expect(page.locator('[data-sales-flow-active-tab="details"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-sales-flow-active-tab="details"] [data-sales-flow-customer-field="company_name"]')).toBeVisible();
      await expect(page.locator('[data-sales-flow-active-tab="details"]')).toContainText('客户公司');

      await page.locator('[data-sales-flow-detail-tab="history"]').click();
      await expect(page.locator('[data-sales-flow-active-tab="history"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-customer-activity-filter="all"]')).toBeVisible();
    } finally {
      await cleanupDetachedCustomer(page, detachedCustomer.id);
    }
  });

  test('multiple downstream stages keep the same three-tab shell and sidebar structure', async ({ page }) => {
    test.slow();

    await loginSalesAdmin(page);

    const stages = [
      'requirement_confirmed',
      'quote_draft',
      'quote_confirmed',
      'contract_signed',
      'support_active',
    ];

    for (const stage of stages) {
      await waitForCustomerFlowDetail(page, seededCustomerFlowStageUrl(stage));

      await expect(page.locator('.ams-sales-flow-detail-panel')).toBeVisible();
      await expect(page.locator('[data-sales-flow-detail-tab="communication"]')).toBeVisible();
      await expect(page.locator('[data-sales-flow-detail-tab="details"]')).toBeVisible();
      await expect(page.locator('[data-sales-flow-detail-tab="history"]')).toBeVisible();
      await expect(page.locator('.ams-sales-stage-shell-side')).toBeVisible();
      await expect(page.locator('.ams-sales-stage-shell-side .ams-card').first()).toBeVisible();

      await page.locator('[data-sales-flow-detail-tab="details"]').click();
      await expect(page.locator('[data-sales-flow-active-tab="details"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('#ams-sales-stage-contacts-save')).toBeVisible();

      await page.locator('[data-sales-flow-detail-tab="history"]').click();
      await expect(page.locator('[data-sales-flow-active-tab="history"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('[data-customer-activity-filter="all"]')).toBeVisible();

      await page.locator('[data-sales-flow-detail-tab="communication"]').click();
      await expect(page.locator('[data-sales-flow-active-tab="communication"]')).toBeVisible({ timeout: 30000 });
      await expect(page.locator('#ams-stage-comment-input')).toBeVisible();
    }
  });

  test('customer tab hosts user info while the right sidebar keeps actions only', async ({ page }) => {
    test.slow();

    const moduleSource = readFileSync(resolve(process.cwd(), 'article_management/modules/quote-system.module.js'), 'utf8');
    expect(moduleSource).toContain("label: '用户信息'");
    expect(moduleSource).toContain('salesStageCustomerSectionMarkup(stageKey, deal, customer)');
    expect(moduleSource).toContain('${salesStageOperationsCardMarkup(stage, deal, customer)}');

    await loginSalesAdmin(page);
    await waitForCustomerFlowDetail(page, seededRequirementFlowUrl());

    await page.locator('[data-sales-flow-detail-tab="customer"]').click();
    await expect(page.locator('[data-sales-flow-active-tab="customer"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-sales-flow-active-tab="customer"]')).toContainText('用户信息');
    await expect(page.locator('[data-sales-flow-active-tab="customer"]')).toContainText('联系邮箱');
    await expect(page.locator('[data-sales-flow-active-tab="customer"]')).toContainText('节点双负责人');

    await expect(page.locator('.ams-sales-stage-shell-side')).toContainText('操作区');
    await expect(page.locator('.ams-sales-stage-shell-side')).not.toContainText('状态区');
    await expect(page.locator('.ams-sales-stage-shell-side')).not.toContainText('用户信息区');
  });
});
