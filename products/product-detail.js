(function () {
    "use strict";

    function normalizeLang(lang) {
        var value = String(lang || "").toLowerCase();
        return value.indexOf("zh") === 0 ? "zh" : "en";
    }

    function readStoredLang() {
        try {
            return window.localStorage.getItem("gasgx-lang") || window.localStorage.getItem("gas_lang");
        } catch (error) {
            return "";
        }
    }

    function writeStoredLang(lang) {
        try {
            window.localStorage.setItem("gasgx-lang", lang);
            window.localStorage.setItem("gas_lang", lang);
        } catch (error) {
            // Storage can fail in restricted browser contexts.
        }
    }

    function getInitialLang() {
        return normalizeLang(readStoredLang() || document.documentElement.lang || "en");
    }

    function applyLanguage(langCandidate) {
        var lang = normalizeLang(langCandidate);
        document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

        document.querySelectorAll("[data-i18n-en], [data-i18n-zh]").forEach(function (node) {
            var value = node.getAttribute("data-i18n-" + lang);
            if (value !== null) node.textContent = value;
        });

        document.querySelectorAll("[data-i18n-html-en], [data-i18n-html-zh]").forEach(function (node) {
            var value = node.getAttribute("data-i18n-html-" + lang);
            if (value !== null) node.innerHTML = value;
        });

        document.querySelectorAll("[data-i18n-title-en], [data-i18n-title-zh]").forEach(function (node) {
            var value = node.getAttribute("data-i18n-title-" + lang);
            if (value !== null) node.setAttribute("title", value);
        });

        if (document.title) {
            var titleNode = document.querySelector("[data-page-title-en]");
            if (titleNode) {
                var title = titleNode.getAttribute("data-page-title-" + lang);
                if (title) document.title = title;
            }
        }

        window.app.lang = lang;
        window.app.currentLang = lang;
        writeStoredLang(lang);
        document.dispatchEvent(new CustomEvent("gasgx:lang-changed", { detail: { lang: lang } }));
    }

    function setupCarousels() {
        document.querySelectorAll("[data-product-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".product-slide"));
            var thumbs = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-thumb]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
            var counterCurrent = carousel.querySelector("[data-carousel-current]");
            var counterTotal = carousel.querySelector("[data-carousel-total]");
            var swipeArea = carousel.querySelector(".gallery-stage");
            var touchStartX = 0;
            var touchStartY = 0;
            var touchActive = false;
            var index = 0;
            if (!slides.length) return;
            if (counterTotal) counterTotal.textContent = String(slides.length).padStart(2, "0");

            function render(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                thumbs.forEach(function (thumb, thumbIndex) {
                    thumb.classList.toggle("is-active", thumbIndex === index);
                    thumb.setAttribute("aria-current", thumbIndex === index ? "true" : "false");
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
                if (counterCurrent) counterCurrent.textContent = String(index + 1).padStart(2, "0");
            }

            carousel.querySelectorAll("[data-carousel-next]").forEach(function (button) {
                button.addEventListener("click", function () { render(index + 1); });
            });
            carousel.querySelectorAll("[data-carousel-prev]").forEach(function (button) {
                button.addEventListener("click", function () { render(index - 1); });
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.addEventListener("click", function () { render(thumbIndex); });
            });
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () { render(dotIndex); });
            });
            if (swipeArea) {
                swipeArea.addEventListener("touchstart", function (event) {
                    if (!event.touches || event.touches.length !== 1) return;
                    touchStartX = event.touches[0].clientX;
                    touchStartY = event.touches[0].clientY;
                    touchActive = true;
                }, { passive: true });
                swipeArea.addEventListener("touchend", function (event) {
                    if (!touchActive || !event.changedTouches || event.changedTouches.length !== 1) return;
                    touchActive = false;
                    var deltaX = event.changedTouches[0].clientX - touchStartX;
                    var deltaY = event.changedTouches[0].clientY - touchStartY;
                    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
                    render(index + (deltaX < 0 ? 1 : -1));
                }, { passive: true });
            }
            render(0);
        });
    }

    function setupProductTabs() {
        document.querySelectorAll("[data-product-tabs]").forEach(function (tabsRoot) {
            var buttons = Array.prototype.slice.call(tabsRoot.querySelectorAll("[data-tab-target]"));
            var panels = Array.prototype.slice.call(tabsRoot.querySelectorAll("[data-tab-panel]"));
            if (!buttons.length || !panels.length) return;

            function activate(tabId) {
                buttons.forEach(function (button) {
                    var active = button.getAttribute("data-tab-target") === tabId;
                    button.classList.toggle("is-active", active);
                    button.setAttribute("aria-selected", active ? "true" : "false");
                });
                panels.forEach(function (panel) {
                    var active = panel.getAttribute("data-tab-panel") === tabId;
                    panel.hidden = !active;
                    panel.classList.toggle("is-active", active);
                });
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activate(button.getAttribute("data-tab-target"));
                });
            });
            activate(buttons[0].getAttribute("data-tab-target"));
        });
    }

    function createQrMatrix(text) {
        var version = 4;
        var size = 17 + version * 4;
        var dataCodewords = 64;
        var eccCodewordsPerBlock = 18;
        var blockCount = 2;
        var modules = createMatrix(size, false);
        var isFunction = createMatrix(size, false);

        function createMatrix(matrixSize, value) {
            var matrix = [];
            for (var y = 0; y < matrixSize; y += 1) {
                matrix.push([]);
                for (var x = 0; x < matrixSize; x += 1) matrix[y].push(value);
            }
            return matrix;
        }

        function setFunctionModule(x, y, dark) {
            if (x < 0 || y < 0 || x >= size || y >= size) return;
            modules[y][x] = dark;
            isFunction[y][x] = true;
        }

        function drawFinderPattern(x, y) {
            for (var dy = -1; dy <= 7; dy += 1) {
                for (var dx = -1; dx <= 7; dx += 1) {
                    var xx = x + dx;
                    var yy = y + dy;
                    var inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
                    var dark = inFinder && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
                    setFunctionModule(xx, yy, dark);
                }
            }
        }

        function drawAlignmentPattern(cx, cy) {
            for (var dy = -2; dy <= 2; dy += 1) {
                for (var dx = -2; dx <= 2; dx += 1) {
                    setFunctionModule(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
                }
            }
        }

        function reserveFormatBits() {
            for (var i = 0; i < 15; i += 1) {
                if (i < 6) setFunctionModule(8, i, false);
                else if (i < 8) setFunctionModule(8, i + 1, false);
                else setFunctionModule(8, size - 15 + i, false);

                if (i < 8) setFunctionModule(size - 1 - i, 8, false);
                else setFunctionModule(14 - i, 8, false);
            }
            setFunctionModule(8, size - 8, true);
        }

        drawFinderPattern(0, 0);
        drawFinderPattern(size - 7, 0);
        drawFinderPattern(0, size - 7);
        drawAlignmentPattern(26, 26);
        for (var i = 8; i < size - 8; i += 1) {
            setFunctionModule(6, i, i % 2 === 0);
            setFunctionModule(i, 6, i % 2 === 0);
        }
        reserveFormatBits();

        var dataBytes = makeQrDataBytes(text, dataCodewords);
        var blocks = [];
        var eccBlocks = [];
        for (var blockIndex = 0; blockIndex < blockCount; blockIndex += 1) {
            var start = blockIndex * 32;
            var block = dataBytes.slice(start, start + 32);
            blocks.push(block);
            eccBlocks.push(computeReedSolomonRemainder(block, eccCodewordsPerBlock));
        }

        var codewords = [];
        for (var dataIndex = 0; dataIndex < 32; dataIndex += 1) {
            for (var blockData = 0; blockData < blockCount; blockData += 1) codewords.push(blocks[blockData][dataIndex]);
        }
        for (var eccIndex = 0; eccIndex < eccCodewordsPerBlock; eccIndex += 1) {
            for (var blockEcc = 0; blockEcc < blockCount; blockEcc += 1) codewords.push(eccBlocks[blockEcc][eccIndex]);
        }

        var bitIndex = 0;
        var totalBits = codewords.length * 8;
        for (var right = size - 1; right >= 1; right -= 2) {
            if (right === 6) right -= 1;
            var upward = ((size - 1 - right) / 2) % 2 === 0;
            for (var vert = 0; vert < size; vert += 1) {
                var y = upward ? size - 1 - vert : vert;
                for (var j = 0; j < 2; j += 1) {
                    var x = right - j;
                    if (isFunction[y][x]) continue;
                    var bit = false;
                    if (bitIndex < totalBits) bit = ((codewords[Math.floor(bitIndex / 8)] >>> (7 - bitIndex % 8)) & 1) === 1;
                    modules[y][x] = bit;
                    bitIndex += 1;
                }
            }
        }

        var bestMatrix = null;
        var bestPenalty = Infinity;
        for (var mask = 0; mask < 8; mask += 1) {
            var masked = modules.map(function (row) { return row.slice(); });
            for (var my = 0; my < size; my += 1) {
                for (var mx = 0; mx < size; mx += 1) {
                    if (!isFunction[my][mx] && getQrMaskBit(mask, mx, my)) masked[my][mx] = !masked[my][mx];
                }
            }
            drawFormatBits(masked, mask, size);
            var penalty = getQrPenaltyScore(masked);
            if (penalty < bestPenalty) {
                bestPenalty = penalty;
                bestMatrix = masked;
            }
        }
        return bestMatrix;
    }

    function makeQrDataBytes(text, dataCodewords) {
        var bytes = [];
        for (var i = 0; i < text.length; i += 1) bytes.push(text.charCodeAt(i) & 0xFF);
        if (bytes.length > 62) throw new Error("QR input is too long for the configured product share code.");

        var bits = [];
        appendBits(bits, 0x4, 4);
        appendBits(bits, bytes.length, 8);
        bytes.forEach(function (value) { appendBits(bits, value, 8); });
        appendBits(bits, 0, Math.min(4, dataCodewords * 8 - bits.length));
        while (bits.length % 8 !== 0) bits.push(0);

        var result = [];
        for (var bitIndex = 0; bitIndex < bits.length; bitIndex += 8) {
            var value = 0;
            for (var j = 0; j < 8; j += 1) value = (value << 1) | bits[bitIndex + j];
            result.push(value);
        }
        for (var pad = 0; result.length < dataCodewords; pad += 1) result.push(pad % 2 === 0 ? 0xEC : 0x11);
        return result;
    }

    function appendBits(bits, value, length) {
        for (var i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
    }

    function getGfTables() {
        if (getGfTables.cache) return getGfTables.cache;
        var exp = [];
        var log = [];
        var value = 1;
        for (var i = 0; i < 255; i += 1) {
            exp[i] = value;
            log[value] = i;
            value <<= 1;
            if (value & 0x100) value ^= 0x11D;
        }
        getGfTables.cache = { exp: exp, log: log };
        return getGfTables.cache;
    }

    function gfMultiply(x, y) {
        if (x === 0 || y === 0) return 0;
        var tables = getGfTables();
        return tables.exp[(tables.log[x] + tables.log[y]) % 255];
    }

    function computeReedSolomonDivisor(degree) {
        var result = [];
        for (var i = 0; i < degree; i += 1) result.push(0);
        result[degree - 1] = 1;
        var root = 1;
        for (var j = 0; j < degree; j += 1) {
            for (var k = 0; k < degree; k += 1) {
                result[k] = gfMultiply(result[k], root);
                if (k + 1 < degree) result[k] ^= result[k + 1];
            }
            root = gfMultiply(root, 0x02);
        }
        return result;
    }

    function computeReedSolomonRemainder(data, degree) {
        var divisor = computeReedSolomonDivisor(degree);
        var result = [];
        for (var i = 0; i < degree; i += 1) result.push(0);
        data.forEach(function (value) {
            var factor = value ^ result.shift();
            result.push(0);
            divisor.forEach(function (coefficient, index) {
                result[index] ^= gfMultiply(coefficient, factor);
            });
        });
        return result;
    }

    function getQrMaskBit(mask, x, y) {
        if (mask === 0) return (x + y) % 2 === 0;
        if (mask === 1) return y % 2 === 0;
        if (mask === 2) return x % 3 === 0;
        if (mask === 3) return (x + y) % 3 === 0;
        if (mask === 4) return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        if (mask === 5) return (x * y) % 2 + (x * y) % 3 === 0;
        if (mask === 6) return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
        return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
    }

    function drawFormatBits(matrix, mask, size) {
        var bits = getFormatBits(mask);
        function set(x, y, dark) { matrix[y][x] = dark; }
        for (var i = 0; i < 15; i += 1) {
            var dark = ((bits >>> i) & 1) === 1;
            if (i < 6) set(8, i, dark);
            else if (i < 8) set(8, i + 1, dark);
            else set(8, size - 15 + i, dark);

            if (i < 8) set(size - 1 - i, 8, dark);
            else set(14 - i, 8, dark);
        }
        set(8, size - 8, true);
    }

    function getFormatBits(mask) {
        var data = mask; // Error correction level M uses format bits 00.
        var bits = data << 10;
        var generator = 0x537;
        while (getBitLength(bits) - getBitLength(generator) >= 0) {
            bits ^= generator << (getBitLength(bits) - getBitLength(generator));
        }
        return ((data << 10) | bits) ^ 0x5412;
    }

    function getBitLength(value) {
        var length = 0;
        while (value !== 0) {
            length += 1;
            value >>>= 1;
        }
        return length;
    }

    function getQrPenaltyScore(matrix) {
        var size = matrix.length;
        var score = 0;
        var x;
        var y;
        for (y = 0; y < size; y += 1) score += getLinePenalty(matrix[y]);
        for (x = 0; x < size; x += 1) {
            var column = [];
            for (y = 0; y < size; y += 1) column.push(matrix[y][x]);
            score += getLinePenalty(column);
        }
        for (y = 0; y < size - 1; y += 1) {
            for (x = 0; x < size - 1; x += 1) {
                var color = matrix[y][x];
                if (color === matrix[y][x + 1] && color === matrix[y + 1][x] && color === matrix[y + 1][x + 1]) score += 3;
            }
        }
        var dark = 0;
        for (y = 0; y < size; y += 1) {
            for (x = 0; x < size; x += 1) if (matrix[y][x]) dark += 1;
        }
        score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
        return score;
    }

    function getLinePenalty(line) {
        var score = 0;
        var runColor = line[0];
        var runLength = 1;
        for (var i = 1; i < line.length; i += 1) {
            if (line[i] === runColor) {
                runLength += 1;
                if (runLength === 5) score += 3;
                else if (runLength > 5) score += 1;
            } else {
                runColor = line[i];
                runLength = 1;
            }
        }
        return score;
    }

    function setupProductShare() {
        var modal = document.getElementById("g300-share-modal");
        var openButton = document.querySelector("[data-product-share-open]");
        if (!modal || !openButton) return;

        var copyBox = document.getElementById("g300-share-copy");
        var posterImage = document.getElementById("g300-share-poster");
        var statusNode = modal.querySelector("[data-product-share-status]");
        var nativeButton = modal.querySelector("[data-product-share-native]");
        var posterDataUrl = "";
        var posterBlob = null;
        var posterLang = "";
        var lastFocused = null;

        function t(en, zh) {
            return normalizeLang(window.app && window.app.lang) === "zh" ? zh : en;
        }

        function getShareUrl() {
            return "https://www.gasgx.com/products/300kw/";
        }

        function getShareTitle() {
            return t("GasGx G300 - 300kW Gas Generator Set", "GasGx G300 - 300kW 燃气发电机组");
        }

        function getShareText() {
            if (normalizeLang(window.app && window.app.lang) === "zh") {
                return [
                    "GasGx G300 300kW 燃气发电机组",
                    "持续功率：300kW",
                    "电效率：37%",
                    "基础配置报价：$36,800",
                    "质保时间：8000h",
                    "适用于分布式能源、项目现场常用电源与燃气算力部署。",
                    getShareUrl()
                ].join("\n");
            }
            return [
                "GasGx G300 300kW Gas Generator Set",
                "Continuous power: 300kW",
                "Electrical efficiency: 37%",
                "Base configuration quote: $36,800",
                "Warranty time: 8000h",
                "A compact gas power solution for distributed energy, project-site prime power and gas-to-computing deployments.",
                getShareUrl()
            ].join("\n");
        }

        function setStatus(message) {
            if (!statusNode) return;
            statusNode.textContent = message || "";
        }

        function updateCopy() {
            if (copyBox) copyBox.value = getShareText();
        }

        function showModal() {
            lastFocused = document.activeElement;
            updateCopy();
            modal.hidden = false;
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("product-share-lock");
            window.setTimeout(function () {
                modal.classList.add("is-open");
                var closeButton = modal.querySelector("[data-product-share-close]");
                if (closeButton) closeButton.focus();
            }, 0);
            generatePoster();
        }

        function closeModal() {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("product-share-lock");
            window.setTimeout(function () {
                modal.hidden = true;
                if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
            }, 180);
        }

        function copyText(value, successMessage) {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                return navigator.clipboard.writeText(value).then(function () {
                    setStatus(successMessage);
                }).catch(function () {
                    return fallbackCopyText(value, successMessage);
                });
            }
            return fallbackCopyText(value, successMessage);
        }

        function fallbackCopyText(value, successMessage) {
            var textarea = document.createElement("textarea");
            textarea.value = value;
            textarea.setAttribute("readonly", "readonly");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");
                setStatus(successMessage);
            } catch (error) {
                setStatus(t("Copy failed. Please select and copy manually.", "复制失败，请手动选中文案复制。"));
            }
            document.body.removeChild(textarea);
            return Promise.resolve();
        }

        function loadImage(src) {
            return new Promise(function (resolve, reject) {
                var image = new Image();
                image.onload = function () { resolve(image); };
                image.onerror = reject;
                image.src = src;
            });
        }

        function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
            var words = String(text).split(" ");
            var line = "";
            var lineCount = 0;
            words.forEach(function (word, index) {
                var testLine = line ? line + " " + word : word;
                if (ctx.measureText(testLine).width > maxWidth && line) {
                    ctx.fillText(line, x, y + lineCount * lineHeight);
                    line = word;
                    lineCount += 1;
                } else {
                    line = testLine;
                }
                if (index === words.length - 1 && line) ctx.fillText(line, x, y + lineCount * lineHeight);
            });
            return y + (lineCount + 1) * lineHeight;
        }

        function drawQrCode(ctx, matrix, x, y, sizePx) {
            var moduleCount = matrix.length;
            var quiet = 4;
            var moduleSize = Math.floor(sizePx / (moduleCount + quiet * 2));
            var actualSize = moduleSize * (moduleCount + quiet * 2);
            ctx.fillStyle = "#fff";
            ctx.fillRect(x, y, actualSize, actualSize);
            ctx.fillStyle = "#050505";
            for (var row = 0; row < moduleCount; row += 1) {
                for (var col = 0; col < moduleCount; col += 1) {
                    if (matrix[row][col]) {
                        ctx.fillRect(x + (quiet + col) * moduleSize, y + (quiet + row) * moduleSize, moduleSize, moduleSize);
                    }
                }
            }
            return actualSize;
        }

        function canvasToBlob(canvas) {
            return new Promise(function (resolve) {
                if (!canvas.toBlob) {
                    resolve(null);
                    return;
                }
                canvas.toBlob(function (blob) { resolve(blob); }, "image/png");
            });
        }

        function generatePoster() {
            var lang = normalizeLang(window.app && window.app.lang);
            if (posterDataUrl && posterLang === lang) return Promise.resolve(posterDataUrl);
            setStatus(t("Generating poster...", "正在生成海报..."));

            var canvas = document.createElement("canvas");
            canvas.width = 1920;
            canvas.height = 1080;
            var ctx = canvas.getContext("2d");
            var imagePromise = loadImage("/products/img/300kw/0.png").catch(function () { return null; });

            return imagePromise.then(function (productImage) {
                var gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
                gradient.addColorStop(0, "#172414");
                gradient.addColorStop(0.5, "#10202c");
                gradient.addColorStop(1, "#050505");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 1920, 1080);

                ctx.fillStyle = "rgba(93, 214, 44, 0.16)";
                ctx.beginPath();
                ctx.arc(1590, 145, 420, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(13, 148, 136, 0.18)";
                ctx.beginPath();
                ctx.arc(260, 980, 520, 0, Math.PI * 2);
                ctx.fill();

                if (productImage) {
                    var sourceRatio = productImage.width / productImage.height;
                    var targetW = 820;
                    var targetH = 462;
                    var sourceW = productImage.width;
                    var sourceH = sourceW / (targetW / targetH);
                    if (sourceH > productImage.height) {
                        sourceH = productImage.height;
                        sourceW = sourceH * (targetW / targetH);
                    }
                    var sourceX = (productImage.width - sourceW) / 2;
                    var sourceY = Math.max(0, (productImage.height - sourceH) / 2);
                    if (sourceRatio > 0) {
                        ctx.drawImage(productImage, sourceX, sourceY, sourceW, sourceH, 78, 86, targetW, targetH);
                    }
                }

                ctx.strokeStyle = "rgba(93, 214, 44, 0.45)";
                ctx.lineWidth = 3;
                ctx.strokeRect(78, 86, 820, 462);

                ctx.fillStyle = "#5dd62c";
                ctx.font = "900 28px Inter, Arial, sans-serif";
                ctx.fillText("GasGx Product Brief", 980, 130);

                ctx.fillStyle = "#ffffff";
                ctx.font = "900 92px Inter, Arial, sans-serif";
                ctx.fillText("GasGx G300", 980, 222);

                ctx.fillStyle = "#cbd5e1";
                ctx.font = "500 34px Inter, Arial, sans-serif";
                drawWrappedText(ctx, t("300kW gas generator set for distributed energy and gas-to-computing deployments.", "面向分布式能源与燃气算力部署的 300kW 燃气发电机组。"), 982, 292, 760, 48);

                var metrics = [
                    ["300kW", t("Continuous power", "持续功率")],
                    ["37%", t("Electrical efficiency", "电效率")],
                    ["$36,800", t("Base quote", "基础报价")],
                    ["8000h", t("Warranty time", "质保时间")]
                ];
                metrics.forEach(function (metric, index) {
                    var col = index % 2;
                    var row = Math.floor(index / 2);
                    var x = 78 + col * 410;
                    var y = 640 + row * 132;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
                    ctx.fillRect(x, y, 360, 98);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
                    ctx.strokeRect(x, y, 360, 98);
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "900 38px Inter, Arial, sans-serif";
                    ctx.fillText(metric[0], x + 24, y + 43);
                    ctx.fillStyle = "#94a3b8";
                    ctx.font = "700 22px Inter, Arial, sans-serif";
                    ctx.fillText(metric[1], x + 24, y + 74);
                });

                var qrCardX = 1360;
                var qrCardY = 700;
                var qrCardSize = 340;
                ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
                ctx.fillRect(qrCardX, qrCardY, qrCardSize, qrCardSize);
                ctx.strokeStyle = "rgba(93, 214, 44, 0.65)";
                ctx.lineWidth = 4;
                ctx.strokeRect(qrCardX, qrCardY, qrCardSize, qrCardSize);
                var qrSize = drawQrCode(ctx, createQrMatrix(getShareUrl()), qrCardX + 60, qrCardY + 40, 220);
                ctx.fillStyle = "#0f172a";
                ctx.font = "900 26px Inter, Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(t("Scan for details", "扫码查看详情"), qrCardX + qrCardSize / 2, qrCardY + 40 + qrSize + 42);
                ctx.textAlign = "left";

                ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
                ctx.fillRect(1260, 480, 520, 168);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
                ctx.strokeRect(1260, 480, 520, 168);
                ctx.fillStyle = "#ffffff";
                ctx.font = "900 36px Inter, Arial, sans-serif";
                ctx.fillText(t("Compact gas power solution", "紧凑型燃气电力方案"), 1290, 540);
                ctx.fillStyle = "#cbd5e1";
                ctx.font = "600 25px Inter, Arial, sans-serif";
                drawWrappedText(ctx, t("Built for project-site prime power, distributed energy and gas-to-computing deployments.", "适用于项目现场主用电源、分布式能源与燃气算力部署。"), 1290, 594, 450, 36);

                ctx.fillStyle = "#8cf06d";
                ctx.font = "900 24px Inter, Arial, sans-serif";
                ctx.fillText("www.gasgx.com/products/300kw/", 78, 1012);

                posterDataUrl = canvas.toDataURL("image/png");
                posterLang = lang;
                if (posterImage) posterImage.src = posterDataUrl;
                return canvasToBlob(canvas).then(function (blob) {
                    posterBlob = blob;
                    setStatus(t("Poster ready. Copy the message or save the poster for WeChat.", "海报已生成，可复制文案或保存海报发给客户。"));
                    return posterDataUrl;
                });
            }).catch(function () {
                setStatus(t("Poster generation failed. Copy the message and link instead.", "海报生成失败，请先复制文案和链接。"));
                return "";
            });
        }

        function downloadPoster() {
            generatePoster().then(function (dataUrl) {
                if (!dataUrl) return;
                var link = document.createElement("a");
                link.download = "GasGx-G300-share-poster.png";
                link.href = dataUrl;
                link.click();
            });
        }

        function nativeShare() {
            generatePoster().then(function () {
                if (!navigator.share) {
                    copyText(getShareText(), t("Message copied for sharing.", "已复制分享文案。"));
                    return;
                }
                var file = posterBlob ? new File([posterBlob], "GasGx-G300-share-poster.png", { type: "image/png" }) : null;
                if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({ title: getShareTitle(), text: getShareText(), url: getShareUrl(), files: [file] }).catch(function () {});
                } else {
                    navigator.share({ title: getShareTitle(), text: getShareText(), url: getShareUrl() }).catch(function () {});
                }
            });
        }

        if (nativeButton && navigator.share) nativeButton.hidden = false;

        openButton.addEventListener("click", showModal);
        modal.querySelectorAll("[data-product-share-close]").forEach(function (button) {
            button.addEventListener("click", closeModal);
        });
        modal.querySelector("[data-product-share-copy-message]").addEventListener("click", function () {
            copyText(getShareText(), t("Message copied. Paste it into WeChat or a direct message.", "文案已复制，可粘贴到微信或私信。"));
        });
        modal.querySelector("[data-product-share-copy-url]").addEventListener("click", function () {
            copyText(getShareUrl(), t("Link copied.", "链接已复制。"));
        });
        modal.querySelector("[data-product-share-download-poster]").addEventListener("click", downloadPoster);
        if (nativeButton) nativeButton.addEventListener("click", nativeShare);

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && !modal.hidden) closeModal();
        });
        document.addEventListener("gasgx:lang-changed", function () {
            updateCopy();
            if (!modal.hidden) {
                posterDataUrl = "";
                generatePoster();
            }
        });
    }

    function refreshProductIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    function enableProductShellOverrides() {
        var config = window.GASGX_SITE_SHELL_CONFIG = window.GASGX_SITE_SHELL_CONFIG || {};
        config.__ggxPublishedSiteShellConfig = true;
        if (Array.isArray(config.navigation)) {
            config.navigation = config.navigation.map(function (item) {
                var path = String(item && item.path || "").replace(/\/+$/, "");
                if (path !== "/products") return item;
                return Object.assign({}, item, {
                    type: "menu",
                    sections: undefined,
                    children: [
                        { title: { en: "300kW", zh: "300kW" }, path: "/products/300kw/" },
                        { title: { en: "1000kW", zh: "1000kW" }, path: "/products/1000kw/" }
                    ]
                });
            });
        }
        if (window.GasGxSharedUI && typeof window.GasGxSharedUI.syncLanguageUI === "function") {
            window.GasGxSharedUI.syncLanguageUI(window.app.lang);
        }
        if (window.GasGxSharedUI && typeof window.GasGxSharedUI.refreshNavigation === "function") {
            window.GasGxSharedUI.refreshNavigation(true);
        }
    }

    window.app = window.app || {};
    window.app.lang = getInitialLang();
    window.app.currentLang = window.app.lang;
    window.app.setLanguage = function (lang) {
        applyLanguage(lang);
    };
    window.app.init = function () {
        setupCarousels();
        setupProductTabs();
        setupProductShare();
        refreshProductIcons();
        enableProductShellOverrides();
        applyLanguage(window.app.lang);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            window.app.init();
        });
    } else {
        window.app.init();
    }

    document.addEventListener("gasgx:site-shell-config-updated", function () {
        window.setTimeout(enableProductShellOverrides, 0);
    });

    window.addEventListener("load", function () {
        window.setTimeout(enableProductShellOverrides, 0);
    });
})();
