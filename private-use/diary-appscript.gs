var DOC_ID = "1gH9-kc5tsF_XfUpvlaonIHIfKKX9atukvmqtAdcnca0";
var ATTACHMENT_FOLDER_NAME = "DiaryAttachments";
var TZ = "Asia/Shanghai";

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

    var doc = DocumentApp.openById(DOC_ID);
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
          url: url
        });
      }
    }

    body.appendParagraph("");
    doc.saveAndClose();

    return jsonOutput_({
      status: "success",
      message: "写入成功",
      attachmentCount: savedAttachments.length,
      attachments: savedAttachments
    });
  } catch (error) {
    return jsonOutput_({
      status: "error",
      message: (error && error.message) ? error.message : String(error)
    });
  }
}

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
