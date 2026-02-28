// 统一日记 Web App：一份脚本处理全部标签写入。
// 你可以按需填写固定文档 ID；留空则会按 routeName 自动创建并缓存文档。
var DOC_ID = "1gH9-kc5tsF_XfUpvlaonIHIfKKX9atukvmqtAdcnca0"; // 默认/个人
var WORK_DOC_ID = "1_XJLQW208MX5BFyPTNM864cCPWTz_9OC2jkR7xw2VBc"; // 工作
var HOME_DOC_ID = ""; // 家庭（可选）
var INSPIRATION_DOC_ID = ""; // 灵感（可选）
var FINANCE_DOC_ID = ""; // 财务（可选）

var ATTACHMENT_FOLDER_NAME = "DiaryAttachments";
var TZ = "Asia/Shanghai";
var AUTO_DOC_TITLE_PREFIX = "Allen-";

// 财务 OCR 自动记账配置（可按需改）
var FINANCE_SPREADSHEET_ID = "1sYZY85kkuUrKS5IVqZw6S3a7TOSXZXfoiVi9dHMI3Gw"; // 固定写入你的财务表
var FINANCE_SPREADSHEET_TITLE = "2026 个人财务流水表";
var FINANCE_WORKSHEET_NAME = "流水";
var FINANCE_SHEET_ID_PROP = "finance_sheet_id_auto";
var FINANCE_OCR_FOLDER_NAME = "FinanceOCRInbox";
var FINANCE_OCR_LANGUAGE = "zh-CN";
var FINANCE_KEEP_OCR_DOC = false;

function doGet() {
  return jsonOutput_({
    status: "ok",
    message: "Diary endpoint is running"
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput_({ status: "error", message: "请求体为空" });
    }

    var payload = JSON.parse(e.postData.contents);
    var formattedEntry = safeString_(payload.formattedEntry || payload.content).trim();
    var rawText = safeString_(payload.rawText).trim();
    var whatText = safeString_(payload.whatText).trim();
    var reviewText = safeString_(payload.reviewText).trim();
    var tags = normalizeTags_(payload.tags);
    var energy = normalizeEnergy_(payload.energy);
    var panelTime = safeString_(payload.panelTime).trim();
    var attachments = Array.isArray(payload.attachments) ? payload.attachments : [];

    if (!formattedEntry) {
      formattedEntry = buildStandardTemplate_(whatText || rawText, reviewText, tags, energy, panelTime);
    }

    if (!formattedEntry && attachments.length === 0) {
      return jsonOutput_({ status: "error", message: "内容不能为空" });
    }

    var routeName = DocRouteModule.resolveRouteName(payload, tags);
    var targetDocId = DocRouteModule.resolveDocId(payload, tags);
    var doc = DocumentApp.openById(targetDocId);
    var body = doc.getBody();
    appendMultiline_(body, formattedEntry);

    var savedAttachments = [];
    if (attachments.length > 0) {
      var folder = getOrCreateFolder_();
      body.appendParagraph("");
      body.appendParagraph("**📎 附件**");

      for (var i = 0; i < attachments.length; i++) {
        var item = attachments[i];
        if (!item) continue;

        var name = sanitizeFileName_(safeString_(item.name) || ("file_" + (i + 1)));
        var mimeType = safeString_(item.mimeType) || "application/octet-stream";
        var kind = safeString_(item.kind) || "file";
        var kindLabel = getAttachmentLabel_(kind);
        var base64 = safeString_(item.base64);

        if (!base64) {
          body.appendParagraph("* [" + kindLabel + "] " + name + "（未上传原文件）");
          continue;
        }

        var bytes = Utilities.base64Decode(base64);
        var blob = Utilities.newBlob(bytes, mimeType, name);
        var file = folder.createFile(blob);
        var url = file.getUrl();

        body.appendParagraph("* [" + kindLabel + "] " + name + "： " + url);

        savedAttachments.push({
          kind: kind,
          name: name,
          url: url,
          fileId: file.getId(),
          mimeType: mimeType,
          size: Number(item.size) || bytes.length
        });
      }
    }

    body.appendParagraph("");
    doc.saveAndClose();

    var financeResult = null;
    if (FinanceBookkeepingModule.shouldProcess(payload, tags, routeName)) {
      financeResult = FinanceBookkeepingModule.process(payload, {
        routeName: routeName,
        panelTime: panelTime,
        savedAttachments: savedAttachments,
        rawAttachments: attachments,
        fallbackText: formattedEntry
      });
    }

    return jsonOutput_({
      status: "success",
      message: "写入成功",
      routeName: routeName,
      targetDocId: targetDocId,
      attachmentCount: savedAttachments.length,
      attachments: savedAttachments,
      finance: financeResult
    });
  } catch (error) {
    return jsonOutput_({
      status: "error",
      message: (error && error.message) ? error.message : String(error)
    });
  }
}

// 独立路由模块：根据标签/targetName 选择并创建目标文档。
var DocRouteModule = (function() {
  var ROUTE_DEFAULT = "个人";
  var ROUTE_ID_PROP_PREFIX = "diary_route_doc_id__";
  var ROUTE_DOC_ID_MAP = {
    "个人": DOC_ID,
    "工作": WORK_DOC_ID,
    "家庭": HOME_DOC_ID,
    "灵感": INSPIRATION_DOC_ID,
    "财务": FINANCE_DOC_ID
  };
  var ROUTE_ALIAS_MAP = {
    "默认": "个人",
    "personal": "个人",
    "work": "工作",
    "home": "家庭",
    "inspiration": "灵感",
    "idea": "灵感",
    "ideas": "灵感",
    "finance": "财务",
    "money": "财务"
  };

  function normalizeRouteName_(value) {
    var name = safeString_(value).replace(/^#/, "").trim();
    if (!name) return "";
    if (ROUTE_DOC_ID_MAP.hasOwnProperty(name)) return name;

    var lower = name.toLowerCase();
    if (ROUTE_ALIAS_MAP.hasOwnProperty(lower)) return ROUTE_ALIAS_MAP[lower];
    if (ROUTE_ALIAS_MAP.hasOwnProperty(name)) return ROUTE_ALIAS_MAP[name];
    return name;
  }

  function resolveRouteName(payload, tags) {
    var explicitName = normalizeRouteName_(payload && payload.targetName);
    if (explicitName) return explicitName;

    var routeTag = normalizeRouteName_(payload && payload.tag);
    if (routeTag) return routeTag;

    if (Array.isArray(tags)) {
      for (var i = 0; i < tags.length; i++) {
        var fromTag = normalizeRouteName_(tags[i]);
        if (fromTag) return fromTag;
      }
    }

    return ROUTE_DEFAULT;
  }

  function resolveDocId(payload, tags) {
    var explicitDocId = safeString_(payload && payload.targetDocId).trim();
    if (explicitDocId) return explicitDocId;

    var routeName = resolveRouteName(payload, tags);
    var configuredDocId = safeString_(ROUTE_DOC_ID_MAP[routeName]).trim();
    if (configuredDocId) return configuredDocId;

    return getOrCreateRouteDocId_(routeName);
  }

  function getOrCreateRouteDocId_(routeName) {
    var routeKey = normalizeRouteName_(routeName) || ROUTE_DEFAULT;
    var propKey = ROUTE_ID_PROP_PREFIX + routeKey;
    var props = PropertiesService.getScriptProperties();
    var cachedId = safeString_(props.getProperty(propKey)).trim();
    if (cachedId) return cachedId;

    var title = buildRouteDocTitle_(routeKey);
    var files = DriveApp.getFilesByName(title);
    if (files.hasNext()) {
      var existingId = files.next().getId();
      props.setProperty(propKey, existingId);
      return existingId;
    }

    var created = DocumentApp.create(title);
    var createdId = created.getId();
    props.setProperty(propKey, createdId);
    return createdId;
  }

  function buildRouteDocTitle_(routeName) {
    return AUTO_DOC_TITLE_PREFIX + " - " + routeName;
  }

  return {
    resolveRouteName: resolveRouteName,
    resolveDocId: resolveDocId
  };
})();

// 财务自动记账模块：OCR 截图 -> 正则提取 -> 追加写入 Google Sheet。
var FinanceBookkeepingModule = (function() {
  var ROUTE_NAME = "财务";
  var FINANCE_HEADERS = [
    "记录时间",
    "交易时间",
    "收支方向",
    "交易账户",
    "交易卡号",
    "付款账号",
    "付款银行",
    "付款方",
    "收款方",
    "交易对手",
    "对方账户",
    "对方银行",
    "金额",
    "余额",
    "币种",
    "渠道",
    "交易摘要",
    "交易分类",
    "流水号",
    "附言",
    "备注",
    "所属账本",
    "是否计入本月收支",
    "标签",
    "截图文件名",
    "截图链接",
    "OCR文档链接",
    "识别状态",
    "识别备注",
    "OCR原文"
  ];

  function shouldProcess(payload, tags, routeName) {
    var route = safeString_(routeName).replace(/^#/, "").trim();
    if (route === ROUTE_NAME) return true;
    var targetName = safeString_(payload && payload.targetName).replace(/^#/, "").trim();
    if (targetName === ROUTE_NAME) return true;
    return containsTag_(tags, ROUTE_NAME);
  }

  function process(payload, context) {
    var imageSources = collectImageSources_(context && context.savedAttachments, context && context.rawAttachments);
    if (!imageSources.length) {
      throw new Error("财务标签提交时请至少上传 1 张转账截图（image/*）。");
    }

    var sheet = getOrCreateFinanceSheet_();
    var rows = [];
    var summaries = [];

    for (var i = 0; i < imageSources.length; i++) {
      var source = imageSources[i];
      var driveFile = ensureDriveFile_(source, i);
      var ocrResult = extractTextByDriveOcr_(driveFile);
      var parsed = parseReceiptText_(ocrResult.text);
      var built = buildFinanceRow_(source, driveFile, ocrResult, parsed);
      rows.push(built.row);
      summaries.push(built.summary);
    }

    if (rows.length > 0) {
      var startRow = Math.max(sheet.getLastRow(), 1) + 1;
      var range = sheet.getRange(startRow, 1, rows.length, FINANCE_HEADERS.length);
      range.setValues(rows);
    }

    return {
      enabled: true,
      rowCount: rows.length,
      spreadsheetId: sheet.getParent().getId(),
      spreadsheetUrl: sheet.getParent().getUrl(),
      sheetName: sheet.getName(),
      records: summaries
    };
  }

  function buildFinanceRow_(source, driveFile, ocrResult, parsed) {
    var nowLabel = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
    var amountCell = parsed.amount === null ? "" : parsed.amount;
    var balanceCell = parsed.balance === null ? "" : parsed.balance;
    var row = [
      nowLabel,
      parsed.transactionTime || "",
      parsed.direction || "",
      parsed.transactionAccount || "",
      parsed.transactionCardNo || "",
      parsed.payerAccount || "",
      parsed.payerBank || "",
      parsed.payer || "",
      parsed.payee || "",
      parsed.counterparty || "",
      parsed.payeeAccount || "",
      parsed.payeeBank || "",
      amountCell,
      balanceCell,
      parsed.currency || "CNY",
      parsed.channel || "",
      parsed.summary || "",
      parsed.category || "",
      parsed.serialNo || "",
      parsed.postscript || "",
      parsed.remark || "",
      parsed.ledger || "",
      parsed.includeInMonth || "",
      ROUTE_NAME,
      source.name || "",
      driveFile.getUrl(),
      ocrResult.ocrDocUrl || "",
      parsed.status,
      parsed.note || "",
      safeString_(ocrResult.text).slice(0, 4000)
    ];

    return {
      row: row,
      summary: {
        fileName: source.name || "",
        amount: amountCell,
        balance: balanceCell,
        direction: parsed.direction || "",
        transactionTime: parsed.transactionTime || "",
        payer: parsed.payer || "",
        payee: parsed.payee || "",
        counterparty: parsed.counterparty || "",
        status: parsed.status
      }
    };
  }

  function collectImageSources_(savedAttachments, rawAttachments) {
    var sources = [];
    var seen = {};

    function pushItem_(item) {
      if (!item) return;
      var name = safeString_(item.name).trim();
      var mimeType = safeString_(item.mimeType).trim();
      var fileId = safeString_(item.fileId).trim();
      if (!isImageAttachment_(name, mimeType)) return;

      var key = fileId || (name + "__" + mimeType + "__" + safeString_(item.base64).slice(0, 24));
      if (seen[key]) return;
      seen[key] = true;

      sources.push({
        name: name || ("finance_" + (sources.length + 1) + ".png"),
        mimeType: mimeType || "application/octet-stream",
        fileId: fileId,
        base64: safeString_(item.base64)
      });
    }

    if (Array.isArray(savedAttachments)) {
      for (var i = 0; i < savedAttachments.length; i++) {
        pushItem_(savedAttachments[i]);
      }
    }

    if (sources.length === 0 && Array.isArray(rawAttachments)) {
      for (var j = 0; j < rawAttachments.length; j++) {
        pushItem_(rawAttachments[j]);
      }
    }

    return sources;
  }

  function isImageAttachment_(name, mimeType) {
    var mime = safeString_(mimeType).toLowerCase();
    var fileName = safeString_(name).toLowerCase();
    if (/^image\//.test(mime)) return true;
    return /\.(png|jpg|jpeg|webp|bmp|gif|heic|heif)$/.test(fileName);
  }

  function ensureDriveFile_(source, index) {
    if (source.fileId) {
      return DriveApp.getFileById(source.fileId);
    }
    if (!source.base64) {
      throw new Error("财务截图读取失败：缺少 base64 数据");
    }

    var folder = getOrCreateFinanceOcrFolder_();
    var safeName = sanitizeFileName_(source.name || ("finance_" + (index + 1) + ".png"));
    var mimeType = safeString_(source.mimeType) || "application/octet-stream";
    var bytes = Utilities.base64Decode(source.base64);
    var blob = Utilities.newBlob(bytes, mimeType, safeName);
    return folder.createFile(blob);
  }

  function getOrCreateFinanceOcrFolder_() {
    var root = DriveApp.getRootFolder();
    var folders = root.getFoldersByName(FINANCE_OCR_FOLDER_NAME);
    if (folders.hasNext()) return folders.next();
    return root.createFolder(FINANCE_OCR_FOLDER_NAME);
  }

  function extractTextByDriveOcr_(file) {
    if (typeof Drive === "undefined" || !Drive.Files) {
      throw new Error("请在 Apps Script 中启用高级服务 Drive API（服务 -> 添加服务 -> Drive API）。");
    }

    var sourceMimeType = safeString_(file.getMimeType()).toLowerCase();
    var sourceName = safeString_(file.getName()).toLowerCase();

    var ocrTitle = "OCR_" + Utilities.formatDate(new Date(), TZ, "yyyyMMdd_HHmmss") + "_" + file.getName();
    var blob = file.getBlob();

    var inserted = null;
    if (Drive.Files.insert) {
      try {
        inserted = Drive.Files.insert({
          title: ocrTitle,
          mimeType: MimeType.GOOGLE_DOCS
        }, blob, {
          ocr: true,
          convert: true,
          ocrLanguage: FINANCE_OCR_LANGUAGE
        });
      } catch (errV2) {
        var detailV2 = (errV2 && errV2.message) ? errV2.message : String(errV2);
        throw new Error("drive.files.insert API 调用失败，错误信息: " + detailV2 + "；文件类型: " + sourceMimeType + "；文件名: " + sourceName);
      }
    } else if (Drive.Files.create) {
      var firstErr = null;
      try {
        inserted = Drive.Files.create({
          name: ocrTitle,
          mimeType: MimeType.GOOGLE_DOCS
        }, blob, {
          ocrLanguage: FINANCE_OCR_LANGUAGE
        });
      } catch (errV3WithLang) {
        firstErr = errV3WithLang;
      }

      if (!inserted) {
        try {
          inserted = Drive.Files.create({
            name: ocrTitle,
            mimeType: MimeType.GOOGLE_DOCS
          }, blob);
        } catch (errV3Plain) {
          var detailFirst = firstErr ? ((firstErr && firstErr.message) ? firstErr.message : String(firstErr)) : "";
          var detailSecond = (errV3Plain && errV3Plain.message) ? errV3Plain.message : String(errV3Plain);
          var fullDetail = detailFirst ? (detailFirst + " | fallback: " + detailSecond) : detailSecond;
          throw new Error("drive.files.create API 调用失败，错误信息: " + fullDetail + "；文件类型: " + sourceMimeType + "；文件名: " + sourceName);
        }
      }
    } else {
      throw new Error("Drive API 已启用但当前版本不支持 Files.insert/create，请检查高级服务版本。");
    }

    var ocrDocId = safeString_(inserted && inserted.id).trim();
    if (!ocrDocId) {
      throw new Error("OCR 识别失败：未生成 OCR 文档");
    }

    var ocrDoc = DocumentApp.openById(ocrDocId);
    var text = ocrDoc.getBody().getText() || "";
    ocrDoc.saveAndClose();

    if (!FINANCE_KEEP_OCR_DOC) {
      try {
        DriveApp.getFileById(ocrDocId).setTrashed(true);
      } catch (err) {
        // 保持主流程可继续，临时 OCR 文档删除失败不阻塞入库。
      }
    }

    return {
      text: text,
      ocrDocId: ocrDocId,
      ocrDocUrl: "https://docs.google.com/document/d/" + ocrDocId + "/edit"
    };
  }

  function parseReceiptText_(rawText) {
    var text = safeString_(rawText).replace(/\u00A0/g, " ").replace(/\r\n/g, "\n");
    var amount = extractAmount_(text);
    var balance = extractBalance_(text);
    var transactionTime = extractTransactionTime_(text);
    var transactionCardNo = extractAccountLikeByLabels_(text, ["交易卡号", "交易卡"]);
    var payerAccount = extractAccountLikeByLabels_(text, [
      "付款账号",
      "付款账户",
      "付款卡号",
      "转出账号",
      "转出账户",
      "扣款账户"
    ]);
    var transactionAccount = pickFirstNonEmpty_([
      extractAccountLikeByLabels_(text, ["交易账户"]),
      transactionCardNo,
      payerAccount
    ]);
    var payerName = extractFieldByLabels_(text, [
      "付款方",
      "付款人",
      "付款户名",
      "转出方",
      "转出户名",
      "来自"
    ]);
    var payeeName = extractFieldByLabels_(text, [
      "对方户名",
      "收款方",
      "收款人",
      "收款户名",
      "对方姓名",
      "收款机构"
    ]);
    var payeeAccount = extractAccountLikeByLabels_(text, [
      "对方账户",
      "对方账号",
      "收款账户",
      "收款账号",
      "转入方",
      "转入账户"
    ]);
    var payerBank = extractFieldByLabels_(text, [
      "付款银行",
      "转出银行",
      "付款机构"
    ]);
    var payeeBank = extractFieldByLabels_(text, [
      "对方银行",
      "收款银行",
      "开户行"
    ]);
    var summary = extractFieldByLabels_(text, [
      "交易摘要",
      "摘要",
      "用途",
      "说明"
    ]);
    var category = extractFieldByLabels_(text, [
      "交易分类",
      "交易类型",
      "分类"
    ]);
    var serialNo = extractFieldByLabels_(text, [
      "流水号",
      "交易单号",
      "订单号",
      "商户订单号"
    ]);
    if (!serialNo) serialNo = extractSerialFallback_(text);
    var postscript = extractFieldByLabels_(text, ["附言", "留言"]);
    var remark = extractFieldByLabels_(text, ["备注"]);
    var ledger = extractLedger_(text);
    var includeInMonth = extractIncludeInMonth_(text);
    var channel = pickFirstNonEmpty_([
      extractFieldByLabels_(text, ["交易渠道", "渠道", "支付渠道"]),
      detectChannel_(text)
    ]);
    var counterparty = pickFirstNonEmpty_([
      extractFieldByLabels_(text, ["对方户名", "对方姓名", "交易对手"]),
      extractMerchantHint_(text),
      extractTopPartyHint_(text),
      extractCounterpartyFromRemark_(remark)
    ]);
    var direction = inferDirection_(amount, category, summary, text);
    var payer = pickFirstNonEmpty_([payerName, payerAccount]);
    var payee = pickFirstNonEmpty_([payeeName, payeeAccount]);

    if (!payer && direction === "支出") payer = pickFirstNonEmpty_([transactionAccount, payerAccount]);
    if (!payee && direction === "支出") payee = counterparty;
    if (!payer && direction === "收入") payer = counterparty;
    if (!payee && direction === "收入") payee = pickFirstNonEmpty_([transactionAccount, payeeAccount]);

    if (!payer) payer = pickFirstNonEmpty_([transactionAccount, extractTopPartyHint_(text)]);
    if (!payee) payee = pickFirstNonEmpty_([payeeAccount, counterparty]);

    var notes = [];
    if (amount === null) notes.push("金额待确认");
    if (!transactionTime) notes.push("交易时间待确认");
    if (!payer) notes.push("付款方待确认");
    if (!payee) notes.push("收款方待确认");

    return {
      amount: amount,
      balance: balance,
      currency: "CNY",
      direction: direction,
      transactionTime: transactionTime,
      transactionAccount: transactionAccount,
      transactionCardNo: transactionCardNo,
      payerAccount: payerAccount,
      payerBank: payerBank,
      payer: payer,
      payee: payee,
      counterparty: counterparty,
      payeeAccount: payeeAccount,
      payeeBank: payeeBank,
      channel: channel,
      summary: summary,
      category: category,
      serialNo: serialNo,
      postscript: postscript,
      remark: remark,
      ledger: ledger,
      includeInMonth: includeInMonth,
      status: (amount !== null && transactionTime) ? "已识别" : "待确认",
      note: notes.join("；")
    };
  }

  function extractAmount_(text) {
    var patterns = [
      /(?:收款金额|转账金额|交易金额|付款金额|实付金额|收入金额|金额)\s*[:：]?\s*[¥￥]?\s*([+-]?\d[\d,]*(?:\.\d{1,2})?)/i,
      /[¥￥]\s*([+-]?\d[\d,]*(?:\.\d{1,2})?)/,
      /(?:CNY|RMB|人民币)\s*([+-]?\d[\d,]*(?:\.\d{1,2})?)/i
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = text.match(patterns[i]);
      if (!match || !match[1]) continue;
      var normalized = parseAmountCandidate_(match[1]);
      if (!isFinite(normalized)) continue;
      return normalized;
    }

    var signedLine = text.match(/(?:^|\n)\s*([+-]\s*[¥￥]?\s*\d[\d,]*(?:\.\d{1,2})?)\s*(?=\n|$)/);
    if (signedLine && signedLine[1]) {
      var signedAmount = parseAmountCandidate_(signedLine[1]);
      if (isFinite(signedAmount)) return signedAmount;
    }

    var lines = text.split("\n");
    for (var j = 0; j < lines.length; j++) {
      var line = safeString_(lines[j]).trim();
      if (!line) continue;
      if (/余额|可用余额|交易时间|流水号|交易分类|理财|榜单|查看往来交易|留言|备注|交易账户/i.test(line)) continue;
      var singleValueMatch = line.match(/^([¥￥]?\s*[+-]?\d[\d,]*(?:\.\d{1,2})?)$/);
      if (!singleValueMatch || !singleValueMatch[1]) continue;
      var lineAmount = parseAmountCandidate_(singleValueMatch[1]);
      if (isFinite(lineAmount)) return lineAmount;
    }

    return null;
  }

  function extractBalance_(text) {
    var patterns = [
      /(?:可用余额|账户余额|余额)\s*[¥￥]?\s*([+-]?\d[\d,]*(?:\.\d{1,2})?)/i,
      /(?:可用余额|账户余额|余额)[^\d+-]*([+-]?\d[\d,]*(?:\.\d{1,2})?)/i
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = text.match(patterns[i]);
      if (!match || !match[1]) continue;
      var value = parseAmountCandidate_(match[1]);
      if (isFinite(value)) return value;
    }
    return null;
  }

  function extractTransactionTime_(text) {
    var patterns = [
      /(20\d{2}[年\/\.\-]\d{1,2}[月\/\.\-]\d{1,2}(?:日)?\s*\d{1,2}:\d{2}(?::\d{2})?)/,
      /(20\d{2}[年\/\.\-]\d{1,2}[月\/\.\-]\d{1,2}(?:日)?)/,
      /(\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)/
    ];
    for (var i = 0; i < patterns.length; i++) {
      var match = text.match(patterns[i]);
      if (!match || !match[1]) continue;
      return normalizeDateTime_(match[1]);
    }
    return "";
  }

  function normalizeDateTime_(rawValue) {
    var value = safeString_(rawValue)
      .replace(/[年\/\.]/g, "-")
      .replace(/月/g, "-")
      .replace(/日/g, "")
      .replace(/\s+/g, " ")
      .trim();

    var match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) return value;

    var year = match[1];
    var month = pad2_(match[2]);
    var day = pad2_(match[3]);
    var hour = pad2_(match[4] || "0");
    var minute = pad2_(match[5] || "0");
    var second = pad2_(match[6] || "0");
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }

  function pad2_(value) {
    var s = String(value || "").trim();
    if (s.length >= 2) return s;
    return "0" + s;
  }

  function extractFieldByLabels_(text, labels) {
    var lines = splitNormalizedLines_(text);
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var labelPattern = escapeRegExp_(label);
      var regex = new RegExp(labelPattern + "\\s*[:：]?\\s*([^\\n]{1,180})", "i");
      var match = text.match(regex);
      var cleaned = match && match[1] ? sanitizeExtractedValue_(match[1]) : "";
      if (cleaned) return cleaned;

      for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        if (line.indexOf(label) === -1) continue;

        var tail = line.replace(new RegExp("^.*?" + labelPattern + "\\s*[:：]?\\s*", "i"), "");
        var tailClean = sanitizeExtractedValue_(tail);
        if (tailClean) return tailClean;

        var collected = [];
        for (var k = j + 1; k < Math.min(lines.length, j + 4); k++) {
          var nextRaw = lines[k];
          if (isLikelyFieldLabel_(nextRaw)) break;
          var nextClean = sanitizeExtractedValue_(nextRaw);
          if (!nextClean) continue;
          if (/^(请选择|查看往来记录|给Ta转账|理财榜单|榜榜有精选|GO)$/i.test(nextClean)) break;
          collected.push(nextClean);
          if (collected.length >= 2) break;
        }
        if (collected.length) return collected.join(" ");
      }
    }
    return "";
  }

  function extractAccountLikeByLabels_(text, labels) {
    var direct = extractFieldByLabels_(text, labels);
    if (direct && /[\d*]{4,}/.test(direct)) {
      return normalizeAccountLike_(direct);
    }

    var lines = splitNormalizedLines_(text);
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      for (var j = 0; j < lines.length; j++) {
        var line = lines[j];
        if (line.indexOf(label) === -1) continue;

        var accParts = [];
        for (var k = j + 1; k < Math.min(lines.length, j + 4); k++) {
          var next = safeString_(lines[k]).trim();
          if (!next) continue;
          if (isLikelyFieldLabel_(next)) break;
          if (!/[\d*]{3,}/.test(next)) continue;
          accParts.push(next);
          if (accParts.length >= 2) break;
        }
        if (accParts.length) {
          return normalizeAccountLike_(accParts.join(""));
        }
      }
    }

    if (direct) return normalizeAccountLike_(direct);
    return "";
  }

  function normalizeAccountLike_(value) {
    return safeString_(value).replace(/\s+/g, "").trim();
  }

  function extractSerialFallback_(text) {
    var lines = splitNormalizedLines_(text);
    for (var i = 0; i < lines.length; i++) {
      var current = safeString_(lines[i]).replace(/\s+/g, "").trim();
      if (!/^\d{10,}$/.test(current)) continue;
      var next = (i + 1 < lines.length) ? safeString_(lines[i + 1]).replace(/\s+/g, "").trim() : "";
      if (/^\d{1,8}$/.test(next)) return current + "-" + next;
      return current;
    }
    return "";
  }

  function extractLedger_(text) {
    var ledger = extractFieldByLabels_(text, ["所属账本", "账本"]);
    if (ledger && !/^(请选择|不计入本月收支)$/i.test(ledger)) return ledger;
    return "";
  }

  function extractIncludeInMonth_(text) {
    if (/不计入本月收支/.test(text)) return "否";
    if (/计入本月收支/.test(text)) return "是";
    return "";
  }

  function inferDirection_(amount, category, summary, text) {
    if (amount !== null && amount !== undefined && isFinite(amount)) {
      if (amount < 0) return "支出";
      if (amount > 0) return "收入";
    }
    var haystack = [category, summary, text].join(" ");
    if (/收入|入账|收款|到账|汇入/.test(haystack)) return "收入";
    if (/支出|付款|消费|转出|扣款|汇出/.test(haystack)) return "支出";
    return "";
  }

  function extractCounterpartyFromRemark_(remark) {
    var value = safeString_(remark).trim();
    if (!value) return "";
    if (/[—\-]/.test(value)) {
      var parts = value.split(/[—\-]+/);
      var last = sanitizeExtractedValue_(parts[parts.length - 1]);
      if (last) return last;
    }
    var company = value.match(/([\u4e00-\u9fa5A-Za-z·\s]{2,60}(?:有限公司|公司|银行|科技|支付))/);
    if (company && company[1]) return sanitizeExtractedValue_(company[1]);
    return sanitizeExtractedValue_(value);
  }

  function splitNormalizedLines_(text) {
    var rows = safeString_(text).replace(/\r\n/g, "\n").split("\n");
    var lines = [];
    for (var i = 0; i < rows.length; i++) {
      var item = safeString_(rows[i]).trim();
      if (item) lines.push(item);
    }
    return lines;
  }

  function isLikelyFieldLabel_(line) {
    var value = safeString_(line).trim();
    if (!value) return false;
    if (/^(交易详情|交易时间|交易账户|交易卡号|交易渠道|交易分类|交易类型|收款账号|收款账户|收款银行|付款账号|付款账户|付款银行|付款方|收款方|对方户名|对方账户|对方账号|对方银行|附言|摘要|交易摘要|所属账本|流水号|备注|留言|通知收款人|查看往来记录|不计入本月收支)$/i.test(value)) {
      return true;
    }
    if (/^(请选择|查看往来记录|给Ta转账|理财榜单|榜榜有精选)$/i.test(value)) return true;
    if (/(交易|账户|账号|卡号|银行|摘要|分类|类型|流水|备注|附言|账本|渠道|时间|金额|余额)$/.test(value)) return true;
    return false;
  }

  function escapeRegExp_(value) {
    return safeString_(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function parseAmountCandidate_(value) {
    var cleaned = safeString_(value)
      .replace(/[−—]/g, "-")
      .replace(/[¥￥,\s]/g, "")
      .trim();
    if (!cleaned) return NaN;
    var normalized = parseFloat(cleaned);
    if (!isFinite(normalized)) return NaN;
    return Math.round(normalized * 100) / 100;
  }

  function sanitizeExtractedValue_(value) {
    var cleaned = safeString_(value)
      .replace(/^[：:\-—\s]+/, "")
      .replace(/\s*>\s*$/, "")
      .replace(/\s*×\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) return "";
    if (/^(交易时间|交易账户|交易卡号|付款账号|付款账户|付款银行|付款方|收款方|交易对手|对方户名|对方账户|对方银行|收款账号|收款账户|收款银行|交易摘要|摘要|交易分类|交易类型|流水号|附言|留言|备注|所属账本|分类|交易渠道|渠道)$/i.test(cleaned)) return "";
    if (/^(点这里|点击|查看往来交易|理财榜单|榜榜有精选|GO\b)/i.test(cleaned)) return "";
    return cleaned;
  }

  function pickFirstNonEmpty_(values) {
    if (!values || !values.length) return "";
    for (var i = 0; i < values.length; i++) {
      var item = safeString_(values[i]).trim();
      if (item) return item;
    }
    return "";
  }

  function extractMerchantHint_(text) {
    var lineMatch = text.match(/[●•]\s*([^\n]{2,120})/);
    if (!lineMatch || !lineMatch[1]) return "";
    return sanitizeExtractedValue_(lineMatch[1]);
  }

  function extractTopPartyHint_(text) {
    var lines = safeString_(text).split("\n");
    for (var i = 0; i < lines.length && i < 12; i++) {
      var line = sanitizeExtractedValue_(lines[i]);
      if (!line) continue;
      if (/^(交易详情|交易时间|交易账户|交易卡号|余额|交易渠道|付款账号|付款银行|收款账号|收款银行|附言|摘要|交易类型|交易分类|所属账本|通知收款人|查看往来记录)$/i.test(line)) continue;
      if (/^[<>]+$/.test(line)) continue;
      if (/^\d{1,2}:\d{2}$/.test(line)) continue;
      if (/[¥￥]|^\s*[+-]?\d[\d,]*(?:\.\d{1,2})?\s*$/.test(line)) continue;
      if (/[\d*]/.test(line)) continue;
      if (/^[\u4e00-\u9fa5A-Za-z·\s]{2,40}$/.test(line)) return line;
    }
    return "";
  }

  function detectChannel_(text) {
    if (/微信|weixin|wechat/i.test(text)) return "微信";
    if (/支付宝|alipay/i.test(text)) return "支付宝";
    if (/云闪付/i.test(text)) return "云闪付";
    if (/银行卡|银行|bank|转账/i.test(text)) return "银行转账";
    return "";
  }

  function getOrCreateFinanceSheet_() {
    var spreadsheet = resolveFinanceSpreadsheet_();
    var targetName = safeString_(FINANCE_WORKSHEET_NAME).trim();
    var sheet = targetName ? spreadsheet.getSheetByName(targetName) : null;
    if (!sheet) {
      var existingSheets = spreadsheet.getSheets();
      if (existingSheets && existingSheets.length > 0) {
        sheet = existingSheets[0];
      } else {
        sheet = spreadsheet.insertSheet(targetName || "流水");
      }
    }
    ensureFinanceHeader_(sheet);
    return sheet;
  }

  function resolveFinanceSpreadsheet_() {
    var explicitId = safeString_(FINANCE_SPREADSHEET_ID).trim();
    if (explicitId) return SpreadsheetApp.openById(explicitId);

    var props = PropertiesService.getScriptProperties();
    var cachedId = safeString_(props.getProperty(FINANCE_SHEET_ID_PROP)).trim();
    if (cachedId) {
      try {
        return SpreadsheetApp.openById(cachedId);
      } catch (err) {
        props.deleteProperty(FINANCE_SHEET_ID_PROP);
      }
    }

    var files = DriveApp.getFilesByName(FINANCE_SPREADSHEET_TITLE);
    while (files.hasNext()) {
      var file = files.next();
      if (safeString_(file.getMimeType()) !== MimeType.GOOGLE_SHEETS) continue;
      var found = SpreadsheetApp.openById(file.getId());
      props.setProperty(FINANCE_SHEET_ID_PROP, found.getId());
      return found;
    }

    var created = SpreadsheetApp.create(FINANCE_SPREADSHEET_TITLE);
    props.setProperty(FINANCE_SHEET_ID_PROP, created.getId());
    return created;
  }

  function ensureFinanceHeader_(sheet) {
    if (sheet.getLastRow() < 1) {
      sheet.getRange(1, 1, 1, FINANCE_HEADERS.length).setValues([FINANCE_HEADERS]);
      return;
    }
    var firstRow = sheet.getRange(1, 1, 1, FINANCE_HEADERS.length).getValues()[0];
    var firstCell = safeString_(firstRow[0]).trim();
    if (!firstCell || firstCell === "记录时间") {
      sheet.getRange(1, 1, 1, FINANCE_HEADERS.length).setValues([FINANCE_HEADERS]);
    }
  }

  function containsTag_(tags, expected) {
    if (!Array.isArray(tags)) return false;
    var target = safeString_(expected).replace(/^#/, "").trim();
    for (var i = 0; i < tags.length; i++) {
      var tag = safeString_(tags[i]).replace(/^#/, "").trim();
      if (tag === target) return true;
    }
    return false;
  }

  return {
    shouldProcess: shouldProcess,
    process: process
  };
})();

function getOrCreateFolder_() {
  var root = DriveApp.getRootFolder();
  var folders = root.getFoldersByName(ATTACHMENT_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return root.createFolder(ATTACHMENT_FOLDER_NAME);
}

function sanitizeFileName_(name) {
  return name.replace(/[\\/:*?"<>|#%&{}$!'@+=`]/g, "_").slice(0, 120);
}

function appendMultiline_(body, text) {
  var lines = safeString_(text).replace(/\r\n/g, "\n").split("\n");
  for (var i = 0; i < lines.length; i++) {
    body.appendParagraph(lines[i]);
  }
}

function normalizeTags_(tags) {
  if (!Array.isArray(tags)) return [];
  var list = [];
  var seen = {};
  for (var i = 0; i < tags.length; i++) {
    var tag = safeString_(tags[i]).replace(/^#/, "").trim();
    if (!tag || seen[tag]) continue;
    list.push(tag);
    seen[tag] = true;
  }
  return list;
}

function normalizeEnergy_(value) {
  var n = Number(value);
  if (!isFinite(n)) return 8;
  n = Math.round(n);
  if (n < 1) return 1;
  if (n > 10) return 10;
  return n;
}

function splitBulletItems_(text) {
  var normalized = safeString_(text).replace(/\r\n/g, "\n");
  var rows = normalized.split("\n");
  var items = [];
  for (var i = 0; i < rows.length; i++) {
    var line = rows[i].replace(/^\s*[*-]\s*/, "").trim();
    if (line) items.push(line);
  }
  return items;
}

function weekdayLabel_(date) {
  var map = {
    "1": "周一",
    "2": "周二",
    "3": "周三",
    "4": "周四",
    "5": "周五",
    "6": "周六",
    "7": "周日"
  };
  var index = Utilities.formatDate(date, TZ, "u");
  return map[index] || "周一";
}

function buildStandardTemplate_(whatText, reviewText, tags, energy, panelTime) {
  var now = new Date();
  var dateLabel = Utilities.formatDate(now, TZ, "yyyy-MM-dd");
  var weekday = weekdayLabel_(now);
  var tagLine = tags.length ? tags.map(function(tag) { return "#" + tag; }).join(" ") : "（未选择）";
  var whatItems = splitBulletItems_(whatText);
  var reviewItems = splitBulletItems_(reviewText);
  var lines = [];
  lines.push("---");
  lines.push("## " + dateLabel + " (" + weekday + ")");
  lines.push("");
  lines.push("**🕒 记录时分**：" + (panelTime || "--:--"));
  lines.push("");
  lines.push("**🏷️ 标签与状态**：" + tagLine + "| 精力值：" + energy + "/10");
  lines.push("");
  lines.push("**📝 今日记录 (What)**");
  if (whatItems.length) {
    for (var i = 0; i < whatItems.length; i++) lines.push("* " + whatItems[i]);
  } else {
    lines.push("* （待补充）");
  }
  lines.push("");
  lines.push("**🧠 思考与复盘 (Why & How)**");
  if (reviewItems.length) {
    for (var j = 0; j < reviewItems.length; j++) lines.push("* " + reviewItems[j]);
  } else {
    lines.push("* （待补充）");
  }
  return lines.join("\n");
}

function getAttachmentLabel_(kind) {
  if (kind === "camera") return "拍摄照片";
  if (kind === "album") return "相册图片";
  return kind || "附件";
}

function safeString_(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
