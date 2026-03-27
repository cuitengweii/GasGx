# Sales Console Test Log

Date: 2026-03-27
Scope: `article_management/sales/index.html` and related modules

## Test Coverage
- Playwright smoke: page load + runtime exception check (`tests/playwright/sales-flow.spec.ts`)
- Source guard: single binding path check for critical save actions
- Manual code-path review for customer -> requirement -> quote -> execution pipeline transitions

## Issues Found
1. High: Dead/missing save path in requirement stage
- Symptom: Save listener existed for `#ams-sales-flow-requirement-save`, but requirement flow markup had no matching button.
- Risk: Requirement edits could not be explicitly persisted from flow UI before confirmation.
- Fix: Added a visible `保存需求` button to requirement action bar and kept confirm gate before save.

2. High: Duplicate event-binding logic for customer/requirement/quote/execution actions
- Symptom: `bindSalesStageListActions` duplicated full action handlers already implemented in dedicated binders.
- Risk: Non-unique entry chain, maintenance drift, and duplicate-trigger regressions.
- Fix: Kept single routing in `bindSalesStageListActions` by delegating only to:
  - `bindSalesCustomerActions`
  - `bindSalesRequirementActions`
  - `bindSalesQuoteActions`
  - `bindSalesExecutionActions`

3. Medium: Important save actions lacked confirmation dialog
- Symptom: Several save actions executed directly.
- Risk: Misclick writes in critical nodes (requirement/quote/stage/customer handoff).
- Fix: Added confirmation modal gates to:
  - customer save and enter requirement
  - requirement save
  - quote terms save
  - execution stage save
  - stage contacts save

4. Medium: Shell event binder had recursive self-call
- Symptom: `bindShellEvents()` called itself recursively.
- Risk: Stack overflow if invoked in future refactor.
- Fix: Replaced with guarded nav binding logic and unified call site in `renderShell()`.

5. UX: Save/next action placement inconsistent across flow cards
- Symptom: action buttons appeared in mixed header/body locations.
- Risk: Operator misses key actions in long forms.
- Fix: Introduced unified sticky action bar pattern (`ams-sales-flow-action-bar`) and applied to customer/requirement/quote/execution key actions.

## Verification Results
- `npx playwright test tests/playwright/sales-flow.spec.ts`
  - Passed: 2/2
  - Checks:
    - sales login renders with no runtime page errors
    - critical save handlers are single-bound in source

## Notes
- Existing legacy test file `tests/playwright/article-management.spec.ts` currently fails due outdated expectations unrelated to this sales-flow change (title/placeholder assertions no longer match current UI baseline).

## Role Simulation Baseline (Added)
- Added dual-role auth test baseline:
  - `tests/playwright/sales-auth-roles.spec.ts`
  - `admin can sign in to sales console`
  - `customer can sign in from public account page`
- Credential input is environment-variable only (no hard-coded secrets).
- Added run guide:
  - `article_management/sales/ROLE_TEST_SETUP.md`
- Local dry run result:
  - `npx playwright test tests/playwright/sales-auth-roles.spec.ts`
  - `2 skipped` (expected when env vars are not set)

## Formal Backend E2E (In Progress)
- Added formal backend chain script:
  - `tests/playwright/sales-formal-backend.spec.ts`
  - Flow: admin login -> customer archive save -> public requirement submit -> requirement confirm -> quote draft create -> quote confirm.
- Current blocker (real backend state):
  - In `quote_confirmed` stage, button `#ams-sales-flow-instance-open-public` is disabled.
  - Means current deal has no available published quote instance for customer-side confirmation entry.
- Action required before this case can fully pass:
  - Ensure at least one valid quote instance is generated and can be published/opened in this formal chain.
  - Validate product-template-to-quote-draft generation outcome for the selected deal (brand/product should not stay `--` in quote stage summary).

## Formal Backend E2E Final Result (Completed)
- Run date: 2026-03-27
- Command set:
  - `npm run test:e2e:sales-formal` (with `GX_ADMIN_EMAIL`/`GX_ADMIN_PASSWORD` env)
  - `npx playwright test tests/playwright/sales-flow.spec.ts tests/playwright/sales-auth-roles.spec.ts tests/playwright/sales-formal-backend.spec.ts`
- Result: `5 passed / 0 failed`

### Additional Defects Found During Formal Chain Validation
5. High: Quote confirmation URL parameter mismatch in formal E2E assertion
- Symptom: test expected `confirmStage/confirmToken`, but actual quote public URL uses `confirm_stage/confirm_token`.
- Risk: false-negative test failure, blocking formal regression signal.
- Fix: updated `tests/playwright/sales-formal-backend.spec.ts` to parse snake_case params.

6. High: Customer confirmation submit prerequisite missing in formal E2E
- Symptom: stage confirmation submit remained enabled and did not complete because required confirmation checkbox was not checked.
- Risk: flow could not advance to contract stage in automation.
- Fix: test now checks `#stage-confirmation-checkbox` before submit and verifies success status text.

7. Medium: Formal chain needed explicit quote publish action before customer confirmation entry
- Symptom: `#ams-sales-flow-instance-open-public` stayed disabled in `quote_confirmed` without published quote snapshot.
- Risk: chain break between internal quote draft and customer confirmation node.
- Fix: formal E2E now opens quote editor popup and triggers `#btn-publish-instance` before entering `quote_confirmed`.

### Current Conclusion
- Sales pipeline from admin creation -> customer requirement submit -> requirement confirmation -> quote draft -> quote publish -> customer quote confirmation -> contract stage transition is now fully validated on formal backend path.
- Key checkpoints for requirement/quote confirmation and operator/customer handoff are covered by automated tests.

## Governance Matrix Validation (New)
- Run date: 2026-03-27
- Spec: `tests/playwright/sales-governance.spec.ts`
- Result: `2 passed / 0 failed`

### Added Coverage
1. Role boundary: customer account cannot enter sales admin console
- Flow: customer logs in from `/account/user.html` -> tries `/article_management/sales/index.html?page=quote-customers`
- Expected: sales login gate is still required (`#ams-login-form` visible), admin shell (`.ams-app-sales`) not rendered.

2. Pipeline guard (pre-confirm rollback protection): quote cannot be advanced before customer confirmation
- Flow: admin creates customer+deal -> customer submits requirement -> admin confirms requirement -> admin creates+publishes quote -> enters `quote_confirmed`
- Expected: `#ams-sales-flow-instance-confirm` remains disabled before customer-side quote confirmation.
- Meaning: critical node is gated, preventing premature advancement to `contract_signed`.
