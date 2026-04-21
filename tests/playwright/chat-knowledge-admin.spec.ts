import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.describe('chat knowledge admin coverage', () => {
  test('knowledge admin exposes keywords, structured source refs, and publish or archive actions', async () => {
    const source = readFileSync(resolve(process.cwd(), 'article_management/modules/chat-knowledge-admin.module.js'), 'utf8');

    expect(source).toContain("setPageHeader('知识库', '管理机器人知识文档和确定性 FAQ 规则。');");
    expect(source).toContain('id="kb-doc-keywords"');
    expect(source).toContain('id="kb-rule-source-refs"');
    expect(source).toContain('id="kb-rule-add-source-ref"');
    expect(source).toContain('data-kb-doc-status="${esc(doc.id)}"');
    expect(source).toContain('data-kb-rule-status="${esc(rule.id)}"');
    expect(source).toContain("moduleState.lastKnowledgeSaveSummary = buildKnowledgeSaveSummary(saved);");
  });

  test('ingestion admin uses chinese guidance, latest run report, and current migration hints', async () => {
    const source = readFileSync(resolve(process.cwd(), 'article_management/modules/chat-knowledge-admin.module.js'), 'utf8');

    expect(source).toContain("setPageHeader('知识采集', '抓取公开站允许范围内的页面，并写入机器人可检索知识。');");
    expect(source).toContain('默认排除路径');
    expect(source).toContain('最终写入状态');
    expect(source).toContain('以下 URL 不在允许采集范围内');
    expect(source).toContain('supabase/migrations/20260420160000_chat_knowledge_rag.sql');
    expect(source).toContain('supabase/migrations/20260421110000_chat_public_site_feature_directory.sql');
  });

  test('chat qa can generate knowledge drafts and navigate back to the knowledge admin page', async () => {
    const adminSource = readFileSync(resolve(process.cwd(), 'article_management/modules/chat-knowledge-admin.module.js'), 'utf8');
    const bootstrapSource = readFileSync(resolve(process.cwd(), 'article_management/modules/app.bootstrap.js'), 'utf8');
    const htmlSource = readFileSync(resolve(process.cwd(), 'article_management/index.html'), 'utf8');

    expect(adminSource).toContain("setPageHeader('机器人质检', '复核聊天记录、补 FAQ 规则，并把缺失知识沉淀成知识草稿。');");
    expect(adminSource).toContain('id="kb-qa-filter-feedback"');
    expect(adminSource).toContain('id="kb-qa-filter-provider"');
    expect(adminSource).toContain('data-chat-knowledge-draft="${esc(log.id)}"');
    expect(adminSource).toContain("source_type: 'internal_sales_kb'");
    expect(adminSource).toContain("visibility: 'internal_sales'");
    expect(adminSource).toContain("status: 'draft'");
    expect(adminSource).toContain("canonical_url: `kb://gasgx/chat-log/${text(log.id)}`");
    expect(adminSource).toContain("await navigateToPage('knowledge');");

    expect(bootstrapSource).toContain("import { renderChatQaAdminPage, renderKnowledgeAdminPage, renderKnowledgeIngestionAdminPage } from './chat-knowledge-admin.module.js?v=20260421chatkb02';");
    expect(bootstrapSource).toContain("async function navigateToPage(page = 'dashboard') {");
    expect(bootstrapSource).toContain('navigateToPage,');
    expect(htmlSource).toContain('./modules/app.bootstrap.js?v=20260421admin35');
  });
});
