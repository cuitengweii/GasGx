(function () {
    "use strict";

    var config = window.GASGX_SITE_SHELL_CONFIG = window.GASGX_SITE_SHELL_CONFIG || {};
    config.site = config.site || {};
    config.site.features = Object.assign({}, config.site.features || {}, {
        languageSwitcherEnabled: true,
        languageOptions: Object.assign({}, config.site.features && config.site.features.languageOptions || {}, {
            en: true,
            zh: true
        })
    });
})();
