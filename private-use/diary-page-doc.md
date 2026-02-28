# Diary 页面技术文档（`private-use/diary.html`）

文档同步日期：2026-02-23（按当前代码实现更新）

## 1. 页面定位
`diary.html` 是单文件 H5 日记页，包含两个主视图：
- 心情选择页（转盘 + 金句）
- 编辑提交页（标签、精力、记录、附件、提交）

核心目标：
- 低操作成本完成每日记录
- 输出结构化 Markdown（适合后续 NotebookLM/文档检索）
- 通过 Google Apps Script Web App 上报数据
- 财务标签走截图上传，交由服务端 OCR 入账

## 2. 代码组织
单 HTML 内三段：
- `style`：全部样式（含移动端适配和提交动画）
- `body`：页面结构 + 模态层 + 隐藏文件输入
- `script`：业务逻辑与事件绑定

逻辑可分为 9 组：
1. 配置常量与数据字典
2. DOM 引用与运行时状态
3. 金句与天气缓存
4. 心情转盘与表情 SVG 渲染
5. 标签模板与健康部位模块
6. 编辑器能力（列表/待办/光标/键盘）
7. 附件上传与 HEIC 转换
8. 提交动画与反馈文案
9. 提交流程与初始化

## 3. 关键常量
- 提交地址：`GAS_WEB_APP_URL`
- 请求超时基线：`REQUEST_TIMEOUT_MS`（60s）
- 请求超时上限：`MAX_REQUEST_TIMEOUT_MS`（330s）
- 单附件上限：`MAX_SINGLE_ATTACHMENT_BYTES`（12MB）
- 总附件上限：`MAX_TOTAL_ATTACHMENT_BYTES`（20MB）
- 草稿键：`DRAFT_KEY`
- 视图状态键：`STATE_KEY`
- 天气缓存键：`WEATHER_CACHE_KEY`
- 金句缓存键：`VERSE_CACHE_KEY`
- 天气缓存时长：`WEATHER_CACHE_MAX_AGE_MS`（30 分钟）
- 时区：`APP_TZ = "Asia/Shanghai"`

常改入口：
- 标签模板文案：`TAG_PROFILE_MAP`
- 标签列表：`TAG_OPTIONS`
- 健康部位：`HEALTH_PART_OPTIONS`
- 天气映射：`mapWmoCodeToWeatherId()`
- Web App 地址：`GAS_WEB_APP_URL`

## 4. 页面结构（DOM）
主视图：
- `#pickerView`
- `#editorView`

编辑页核心：
- 标签：`#tagChips`
- 精力：`#energyInput`、`#energyValue`
- 健康部位：`#healthPartWrap`、`#healthPartRow`
- 输入区：`#entryText`、`#reviewText`
- 附件区：`#attachmentList`
- 工具栏：`#midTools`
- 提交按钮：`#submitBtn`

模态层：
- 天气：`#weatherModal`
- 心情：`#moodModal`
- 贴图：`#stickerModal`
- 提交反馈：`#submitOverlay`

## 5. 运行时状态（State）
关键状态：
- 选择类：`selectedMoodId`、`selectedWeatherId`、`selectedTag`、`selectedHealthPartId`
- 数值类：`energyLevel`
- 编辑类：`attachments`、`lastEditorInput`
- 转盘类：`ringRotationDeg`、`isRingSpinning`
- 天气类：`weatherTempC`、`weatherFeelsLikeC`、`weatherCode`、`weatherIsDay`
- 提交类：`isSubmitting`

必选校验状态：
- `tagSelectedForEntry`
- `energySelectedForEntry`

说明：
- `energyLevel` 默认是 8，但仍要求用户至少拖动过一次滑杆才允许提交（`energySelectedForEntry` 为 `true`）。

## 6. 主要模块

### 6.1 标签模板与健康部位
关键函数：
- `getTagProfile()`
- `applyTagProfile()`
- `renderTagChips()`
- `renderHealthPartChips()`
- `updateHealthPartVisibility()`

行为：
- 选中标签后切换标题、placeholder、Markdown 小节标题和 NotebookLM 关注锚点。
- 仅 `selectedTag === "健康"` 时展示身体部位单选。

### 6.2 心情转盘
关键函数：
- `renderMoodRing()`
- `spinRingToMoodPhysics()`
- `runSlotMachineSpin()`
- `spinRingToRandomMood()`
- `startRingDrag()` / `moveRingDrag()` / `endRingDrag()`

行为：
- 首页进来会执行一次幸运转盘动画。
- 支持拖拽 + 惯性收束，最终高亮落点心情。
- 编辑页可通过 `#paperEmoji` 或 `#paperMood` 打开心情选择弹层微调。

### 6.3 天气
关键函数：
- `refreshWeatherFromLocation()`
- `fetchWeatherSnapshotByCoords()`
- `mapWmoCodeToWeatherId()`
- `applyWeatherToUI()`

行为：
- 使用浏览器定位 + Open-Meteo 拉取 `weather_code/is_day/wind_speed_10m/temperature_2m/apparent_temperature`。
- 体感温度显示在右上角 `weather-feels`。
- 默认点击天气按钮是“刷新定位天气”（不是打开天气选择器）。
- 30 分钟内优先复用缓存（`WEATHER_CACHE_KEY`）。

### 6.4 金句
关键函数：
- `renderBibleVerse()`
- `refreshWeeklyVerses()`
- `fetchWeeklyVerseBatch()`

行为：
- 每周从 `raw.githubusercontent.com/MaatheusGois/bible` 拉取一批中文经文并缓存。
- 失败时回退到内置 `BIBLE_VERSES`。

### 6.5 编辑器（列表/待办/光标）
关键函数：
- `applyListTemplate(mode)`
- `handleSmartListEnter(event, input)`
- `toggleTodoAtCursor(input)`
- `toggleTodoAtTapPosition(input)`
- `rememberEditorSelection()` / `getEditorSelection()`
- `ensureEditorCaretVisible()`
- `updateKeyboardInset()`

支持：
- 有序列表：`1. `
- 无序列表：`- `
- 待办列表：内部标准化为 `[ ]` / `[✓]`
- 兼容识别旧符号：`☐`、`☑`、`✓`、`✔`、`✅`、`- [x]` 等

### 6.6 附件与 HEIC
关键函数：
- `handlePickedFiles()`
- `addAttachment(kind, file)`
- `convertHeicToJpegIfNeeded(file)`
- `fileToBase64(file)`

流程：
1. 相机/相册选图
2. HEIC/HEIF 前端转 JPEG（`heic2any`）
3. 尺寸校验（单文件 12MB，总计 20MB）
4. Base64 入 `attachments`
5. 在当前输入框插入一行附件标记文本

### 6.7 提交反馈层
关键函数：
- `showSubmitOverlay()`
- `hideSubmitOverlay()`
- `buildSubmitSuccessFeedback()`
- `playSubmitEffect()`

效果：
- `loading/error/success` 三态
- 成功态按心情和标签组合文案与特效（`confetti/spark/bubbles/halo`）

## 7. 提交流程（`submitDiary()`）
执行顺序：
1. 校验必选：标签 + 精力操作
2. 财务标签校验：至少 1 张图片附件
3. 校验内容：正文/复盘/附件至少其一
4. 构造模板：`composeStandardTemplate()`
5. 组装 JSON，`Content-Type: text/plain;charset=utf-8` 发送到 GAS
6. 按响应显示成功/失败覆盖层

payload 关键字段：
- 文本：`content`、`formattedEntry`、`rawText`、`whatText`、`reviewText`
- 分类：`targetName`、`tag`、`tags`、`energy`
- 心情：`mood { id, emoji, title }`
- 天气：`weather { id, label, feelsLikeC, temperatureC, weatherCode, isDay }`
- 健康部位：`healthPart { id, label } | null`
- 面板信息：`panelDate`、`panelTime`
- 附件：`attachments[]`（含 `base64`）

请求保护：
- 请求体超过 24MB 直接阻断
- 超时时间按 payload 大小动态估算，上限 `MAX_REQUEST_TIMEOUT_MS`

成功后：
- 通过“返回首页”回调执行 `resetEditorDraftAfterSubmit()`
- 清空文本、标签、健康部位、精力必选状态、附件和 `DRAFT_KEY`
- 心情与天气不在此函数内强制重置

## 8. 本地存储
- `DRAFT_KEY`：草稿（标签、精力、两段文本、天气快照、健康部位、必选状态）
- `STATE_KEY`：当前视图（`picker` / `editor`）
- `WEATHER_CACHE_KEY`：天气缓存
- `VERSE_CACHE_KEY`：周金句缓存

注意：
- `attachments` 不持久化到草稿，刷新后会丢失。

## 9. 初始化顺序
脚本尾部初始化：
1. `renderMoodRing()`
2. `restoreDraft()`
3. `updateMoodUI(false)`
4. `applyWeatherToUI()`
5. `renderTagChips()`
6. `updateEnergyUI()`
7. `renderAttachmentList()`
8. `formatPaperDate()` + `updateClock()`
9. `renderBibleVerse()` + `refreshWeeklyVerses()`
10. `warmConnection()`
11. `updateKeyboardInset()`
12. 绑定所有事件
13. 按 `restoreViewState()` 决定进入 `editor` 或触发首页转盘动画

## 10. 当前实现注意事项
- 天气弹层相关函数仍在，但默认交互入口未启用；天气按钮当前行为是“刷新定位天气”。
- `closePlusMenu()` 目前是兼容保留空函数（`+` 浮层已下线）。
- 代码仍会尝试获取 `#tagGuide`、`#statusMsg`，但当前 DOM 未提供这两个节点；对应逻辑会静默退化，不影响提交流程。

## 11. 常见维护入口
- 改标签模板：`TAG_PROFILE_MAP`
- 改健康部位项：`HEALTH_PART_OPTIONS`
- 改健康部位图标：`renderHealthPartSvg()`
- 改天气映射：`mapWmoCodeToWeatherId()`
- 改提交地址：`GAS_WEB_APP_URL`
- 改列表/待办行为：`parseTodoLine()`、`toggleTodoAtCursor()`、`applyListTemplate()`
- 改 Markdown 模板：`composeStandardTemplate()`

## 12. 排障建议

### 提交提示“必选未选”
排查：
1. 是否已点选标签
2. 是否真的拖动过精力滑杆（不是仅保留默认值）

### 财务提交失败
排查：
1. 是否至少上传 1 张图片附件
2. 单张/总附件大小是否超限
3. HEIC 转换是否成功
4. GAS Web App `exec` 地址是否可用

### 天气异常
排查：
1. 浏览器定位权限是否开启
2. 是否命中 30 分钟缓存
3. Open-Meteo 请求是否被网络策略拦截

### 待办勾选不生效
排查：
1. 当前光标是否在待办行
2. 点击位置是否在 checkbox 附近
3. 行首格式是否可被 `parseTodoLine()` 识别
