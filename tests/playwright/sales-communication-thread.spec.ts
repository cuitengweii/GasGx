import { expect, test, type Page } from '@playwright/test';

const adminEmail = process.env.GX_THREAD_ADMIN_EMAIL || process.env.GX_ADMIN_EMAIL || 'sales-thread-admin@gasgx.dev';
const adminPassword = process.env.GX_THREAD_ADMIN_PASSWORD || process.env.GX_ADMIN_PASSWORD || 'CodexThread!2026';
const customerEmail = process.env.GX_THREAD_CUSTOMER_EMAIL || process.env.GX_CUSTOMER_EMAIL || 'sales-thread-customer@gasgx.dev';
const customerPassword = process.env.GX_THREAD_CUSTOMER_PASSWORD || process.env.GX_CUSTOMER_PASSWORD || 'CodexThread!2026';

const seededCustomerId = process.env.GX_THREAD_CUSTOMER_ID || '44444444-4444-4444-8444-444444444444';
const seededDealId = process.env.GX_THREAD_DEAL_ID || '55555555-5555-4555-8555-555555555555';
const seededStageKey = process.env.GX_THREAD_STAGE_KEY || 'requirement_capture';

const seededBodies = {
  history: 'History note: customer profile is complete.',
  root: 'Please confirm the power mode and preferred miner brand.',
  customerReply: 'We prefer an integrated deployment and Bitmain first.',
  salesReply: 'Received. We will continue with the integrated plan before pricing.',
};

function adminFlowUrl() {
  return `/article_management/sales/index.html?page=quote-customer-flow&customer=${encodeURIComponent(seededCustomerId)}&deal=${encodeURIComponent(seededDealId)}&stage=${encodeURIComponent(seededStageKey)}`;
}

function customerFlowUrl() {
  return `/account/account.html?tab=sales&deal=${encodeURIComponent(seededDealId)}&stage=${encodeURIComponent(seededStageKey)}`;
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

async function loginCustomer(page: Page) {
  await page.goto('/account/user.html', { waitUntil: 'domcontentloaded' });
  const authForm = page.locator('#auth-form');
  const requiresLogin = await authForm.isVisible({ timeout: 5000 }).catch(() => false);

  if (requiresLogin) {
    await page.fill('#email', customerEmail);
    await page.fill('#password', customerPassword);
    await page.locator('#submit-btn').click();
    await page.waitForURL((url) => !url.pathname.endsWith('/account/user.html'), { timeout: 30000 });
  }
}

async function waitForSalesThreadPanel(page: Page) {
  await page.goto(adminFlowUrl(), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const composer = document.querySelector('#ams-stage-comment-input');
    const threads = document.querySelectorAll('.ams-stage-current-comments .ams-comment-thread-stream');
    const groups = document.querySelectorAll('.ams-comment-history-group');
    return Boolean(composer) && threads.length > 0 && groups.length >= 2;
  }, { timeout: 90000 });
}

async function waitForCustomerThreadPanel(page: Page) {
  await page.goto(customerFlowUrl(), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction((expectedRoot) => {
    const root = document.querySelector('#sales-pipeline-root');
    const composer = document.querySelector('#sales-comment-input');
    return Boolean(root)
      && Boolean(composer)
      && String(root.textContent || '').includes(String(expectedRoot || ''));
  }, seededBodies.root, { timeout: 90000 });
}

test.describe('Sales communication thread regression', () => {
  test.setTimeout(180000);

  test('sales backend and customer portal show the same public requirement thread', async ({ page, browser }) => {
    const activityReadFailures: string[] = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('quote_activity_reads') && response.status() >= 400) {
        activityReadFailures.push(`${response.status()} ${url}`);
      }
    });

    await loginSalesAdmin(page);
    await waitForSalesThreadPanel(page);

    await expect(page.locator('#ams-stage-comment-input')).toBeVisible();
    await expect(page.locator('.ams-stage-current-comments .ams-comment-thread-stream')).toHaveCount(1);
    await expect(page.locator('.ams-stage-current-comments .ams-comment-thread-replies .ams-comment-thread-row')).toHaveCount(2);
    await expect(page.locator('.ams-comment-history-group')).toHaveCount(2);
    await expect(page.locator('.ams-stage-current-comments')).toContainText(seededBodies.root);
    await expect(page.locator('.ams-stage-current-comments')).toContainText(seededBodies.customerReply);
    await expect(page.locator('.ams-stage-current-comments')).toContainText(seededBodies.salesReply);
    await expect(page.locator('.ams-stage-comments-card > details .ams-fold-body')).toContainText(seededBodies.history);

    await page.locator('.ams-stage-current-comments [data-stage-comment-reply]').first().click();
    await expect(page.locator('[data-stage-comment-reply-cancel]')).toBeVisible();
    await expect(page.locator('.ams-comment-reply-banner strong')).toContainText('Please confirm the power mode');
    expect(activityReadFailures, `quote_activity_reads failures: ${activityReadFailures.join(' | ')}`).toHaveLength(0);

    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();

    try {
      await loginCustomer(customerPage);
      await waitForCustomerThreadPanel(customerPage);

      await expect(customerPage.locator('#sales-comment-input')).toBeVisible();
      await expect(customerPage.locator('#sales-pipeline-root')).toContainText(seededBodies.root);
      await expect(customerPage.locator('#sales-pipeline-root')).toContainText(seededBodies.customerReply);
      await expect(customerPage.locator('#sales-pipeline-root')).toContainText(seededBodies.salesReply);
      await expect(customerPage.locator('[data-sales-comment-reply]')).toHaveCount(3);

      await customerPage.locator('[data-sales-comment-reply]').first().click();
      await expect(customerPage.locator('[data-sales-comment-reply-cancel]')).toBeVisible();
      await expect(customerPage.locator('body')).toContainText('Please confirm the power mode');
    } finally {
      await customerContext.close();
    }
  });
});
