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
