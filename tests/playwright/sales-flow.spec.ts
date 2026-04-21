import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.describe('Sales console safety checks', () => {
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
});
