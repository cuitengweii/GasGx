# GasGx 网站后台 Lessons

更新时间：2026-03-21

## Lesson 1：重绘页面时不要重复绑定委托事件

错误表现：

- 站点壳编辑器里的折叠按钮看起来“点不了”
- 实际是事件被重复绑定，点击一次会触发多次处理，UI 状态被来回切换

根因：

- 编辑页每次 `rerender` 后都会重新执行 `bindEditor`
- 委托监听绑在 `#ams-content` 上，但没有防重复绑定

如何更早发现：

- 对树形折叠、分页、切换这类“只改局部状态”的交互，重绘后立即手测一次
- 重点检查“点一下是否只触发一次”

如何避免复发：

- 委托监听只绑定一次
- 把当前运行时依赖保存在模块状态里，重绘时只更新依赖引用
- 以后做单页后台局部重绘时，默认优先考虑事件复用，而不是每次重新挂监听
## Lesson 2: "Looks like the page" is not the same as editing the real page

Error symptom:
- A fake visual editor was built first, but it still did not satisfy the requirement for "1:1 template editing".
- The user expected the real template file itself to become editable, not a similar admin shell.

Root cause:
- "1:1" was interpreted as visual similarity instead of DOM-level identity with the final quote page.

How to detect earlier:
- For editing-heavy UI requests, confirm whether "1:1" means:
  - identical layout only
  - or the final runtime page itself as the editor

How to prevent recurrence:
- When the user says "template", "same page", or "1:1", default to checking whether the final page DOM must be the editing surface.

## Lesson 3: Spark stream status must not use `||` defaulting

Error symptom:
- Spark translation initially returned only the first fragment such as `{\"`, causing parse failure and Chinese fallback.

Root cause:
- Stream completion logic used `choices.status || 2`.
- When Spark returned `status: 0`, JavaScript treated it as falsy and incorrectly converted it to `2`, ending the stream too early.

How to detect earlier:
- Always inspect raw streamed frames when an LLM/WebSocket provider appears to return partial JSON.

How to prevent recurrence:
- For streamed numeric status fields, use nullish checks such as `choices.status ?? 2` instead of truthy/falsy defaulting.

## Lesson 4: Hidden admin fields must not be hard validation blockers

Error symptom:
- Saving a copied product template failed with `请至少填写一个产品标题`, but the operator could not find any visible field for that requirement in the current product-template surface.

Root cause:
- The save contract still enforced a localized `public_title` requirement even when the relevant editor field was hidden lower in the page or not surfaced in the current bootstrap workflow.

How to detect earlier:
- After compacting or hiding parts of an admin form, always run one end-to-end create/save flow from the visible controls only.
- Any validation message that points to a field the operator cannot currently see is a release blocker.

How to prevent recurrence:
- Either surface every required field near the primary save path, or provide deterministic fallback values from visible inputs such as `product_code` or `slug`.
- Treat "hidden but required" combinations as a design bug, not just a missing translation or copy issue.

## Lesson 5: Shared panel CSS must not leak instance-specific visibility rules into other admin surfaces

Error symptom:
- Newly added brand default-link panel and copied product editor blocks appeared to save or load correctly, but were invisible in the page after deployment.

Root cause:
- Brand/product pages reused container classes that were also targeted by quote-instance-specific `display: none` rules.

How to detect earlier:
- After reusing an existing admin container class, inspect the final page with all inherited CSS rules applied instead of trusting local DOM insertion alone.

How to prevent recurrence:
- Keep instance-only layout classes scoped to quote-instance pages.
- For shared admin primitives, prefer neutral container names and page-specific modifier classes so new surfaces do not inherit hidden-state contracts accidentally.

## Lesson 6: Requirement workflow semantics must be settled before deepening the admin UI

Error symptom:
- A requirement page was built first as an internal admin intake worksheet, but that model did not match the real business handoff the user expected.
- The user actually needed a public customer-facing requirement link between early chat and quote generation.

Root cause:
- “需求单” was initially interpreted as an internal CRM stage instead of a customer-submitted public form stage.
- The entity shape was roughly correct, but the workflow role was wrong.

How to detect earlier:
- For pipeline-style business entities, confirm who fills the record, where the record lives, and what event locks the record for downstream work.
- “客户需求单” should immediately trigger a check for:
  - internal-only
  - external/public
  - versioned or mutable after submission

How to prevent recurrence:
- Before extending a new workflow entity, define the actor and handoff model first:
  - who creates it
  - who edits it
  - what counts as final submission
  - what downstream action becomes allowed only after that submission

## Lesson 7: Bootstrap-side DOM surgery plus browser cache creates false negatives during admin UI fixes

Error symptom:
- Controls existed in `quote-system.module.js` template output, but operators still saw them missing or misplaced on the live customer-flow page.
- Refreshing the page sometimes appeared to do nothing even after the template had already been corrected.

Root cause:
- `sales.bootstrap.js` was still mutating customer-flow business DOM after render.
- At the same time, stale cached bootstrap/module assets made the page continue to run old relocation/removal logic even after source fixes landed.

How to detect earlier:
- When a UI control is visibly present in template source but absent on screen, inspect post-render DOM mutations before assuming the template is still wrong.
- Compare the loaded module version string in the page entry with the latest local edit before spending more time on business logic.

How to prevent recurrence:
- Keep business DOM ownership inside the feature module and leave bootstrap files to shell concerns only.
- When untangling a DOM-mutation bug, pair the structural fix with an explicit cache-busting version bump so the browser cannot keep executing stale code.

## Lesson 8: Large event-binder refactors should be finished in two explicit phases

Error symptom:
- Helper binders for requirement, quote, and execution actions were successfully extracted, but the root binder still retained the old monolithic body.
- This left the codebase in a partial migration state that was safer than a broken rewrite, but still more complex than intended.

Root cause:
- The source function was too large to replace cleanly in one patch, and trying to collapse extraction plus dispatcher replacement at once increased patch fragility.

How to detect earlier:
- After extracting helpers from a large binder, explicitly verify whether the root function has actually become a dispatcher or still contains the original body.
- Treat "helpers exist" and "dispatcher cleanup is complete" as two different checkpoints.

How to prevent recurrence:
- Use a staged refactor plan for oversized event functions:
  1. extract helpers
  2. verify helpers
  3. replace root binder with dispatch-only wiring
  4. run a full flow regression pass
- Record the partial-state checkpoint in the state doc immediately so the next thread does not mistake helper extraction for a finished event-layer refactor.
