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
                        { title: { en: "300kW", zh: "300kW" }, path: "/products/300kw" },
                        { title: { en: "1000kW", zh: "1000kW" }, path: "/products/1000kw" }
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
