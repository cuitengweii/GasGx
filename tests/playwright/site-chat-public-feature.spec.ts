import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.describe('site-chat public feature coverage', () => {
  test('normalizes broader tools/resources synonyms for deterministic public-feature routing', async () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/site-chat/index.ts'), 'utf8');

    expect(source).toContain("replace(/\\u8d44\\u6e90\\u4e2d\\u5fc3|\\u8d44\\u6599\\u4e2d\\u5fc3|\\u8d44\\u6e90\\u9875|\\u8d44\\u6599\\u9875/g, ' resources hub ')");
    expect(source).toContain("replace(/\\u5de5\\u5177\\u4e2d\\u5fc3|\\u5de5\\u5177\\u9875/g, ' tools hub ')");
    expect(source).toContain("replace(/\\u6848\\u4f8b|\\u6210\\u529f\\u6848\\u4f8b/g, ' case studies ')");
    expect(source).toContain("replace(/\\u89c6\\u9891|\\u89c6\\u9891\\u8d44\\u6599/g, ' videos ')");
    expect(source).toContain("replace(/\\u767d\\u76ae\\u4e66/g, ' whitepapers ')");
    expect(source).toContain("replace(/\\u8ba4\\u8bc1|\\u8bc1\\u4e66/g, ' certifications ')");
    expect(source).toContain("replace(/\\u77ff\\u673a\\u9009\\u8d2d|\\u77ff\\u673a\\u9009\\u578b/g, ' miner buying guide ')");
    expect(source).toContain("replace(/\\u8d44\\u672c\\u56de\\u62a5|\\u8d44\\u672c\\u56de\\u62a5\\u7387/g, ' roce ')");
  });

  test('adds deterministic matches for expanded resource and tool entries before generic scoring fallback', async () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/site-chat/index.ts'), 'utf8');

    expect(source).toContain("return buildPublicFeatureCraftedReply('site_resources', language, ['resource_datasheets', 'resource_reports'], 'public_feature_site_resources');");
    expect(source).toContain("return buildPublicFeatureCraftedReply('tools_overview', language, ['tool_site_fit', 'tool_gas_fit'], 'public_feature_tools_overview');");
    expect(source).toContain("return buildPublicFeatureCraftedReply('resource_case_studies', language, ['resource_reports', 'resource_datasheets'], 'public_feature_resource_case_studies');");
    expect(source).toContain("return buildPublicFeatureCraftedReply('resource_videos', language, ['resource_case_studies', 'resource_whitepapers'], 'public_feature_resource_videos');");
    expect(source).toContain("return buildPublicFeatureCraftedReply('resource_whitepapers', language, ['resource_reports', 'resource_case_studies'], 'public_feature_resource_whitepapers');");
    expect(source).toContain("return buildPublicFeatureCraftedReply('resource_certifications', language, ['tool_global_compliance', 'resource_datasheets'], 'public_feature_resource_certifications');");
    expect(source).toContain("return buildPublicFeatureCraftedReply('tool_miner_buying_guide', language, ['tool_mining_power_calc', 'tool_miner_profitability'], 'public_feature_tool_miner_buying_guide');");
    expect(source).toContain("return buildPublicFeatureCraftedReply('tool_roce_calculator', language, ['tool_roi', 'tool_lcoe_calculator'], 'public_feature_tool_roce_calculator');");
  });

  test('locks assistant identity to GasGx and rejects Spark or XFYUN self-introductions', async () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/site-chat/index.ts'), 'utf8');

    expect(source).toContain('Your external identity is always GasGx Assistant / GasGx 智能顾问.');
    expect(source).toContain('Never say you are Spark, XFYUN, iFlytek, a large language model, or the underlying model provider.');
    expect(source).toContain('function hasAssistantIdentityLeak(reply: string): boolean {');
    expect(source).toContain('function recoverIdentityLeakReply(');
    expect(source).toContain('if (hasAssistantIdentityLeak(reply)) {');
    expect(source).toContain("provider: 'gasgx_policy'");
  });

  test('removes the robotic chinese fallback preface so replies start directly from useful content', async () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/site-chat/index.ts'), 'utf8');

    expect(source).not.toContain('我先根据当前 GasGx 知识库里最相关的内容给你一个直接结论：');
    expect(source).toContain("if (language === 'zh') {\n        return [\n            ...sourceLines,");
  });
  test('adds anti-robotic prompt rules and cleaner fallback phrasing', async () => {
    const source = readFileSync(resolve(process.cwd(), 'supabase/functions/site-chat/index.ts'), 'utf8');

    expect(source).toContain('Never narrate your own process or retrieval with lead-ins like "根据当前知识库"');
    expect(source).toContain('Avoid formulaic sales filler such as "我可以帮你整理成售前简表" unless the user explicitly asks for a brief or a draft email.');
    expect(source).not.toContain('Here is the most relevant GasGx knowledge I can confirm right now:');
    expect(source).not.toContain('If helpful, I can also turn this into a short pre-sales brief for ');
    expect(source).toContain('If you want to keep moving toward a solution or quotation, send me: ');
  });
});
