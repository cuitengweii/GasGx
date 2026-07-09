(function () {
    "use strict";

    var config = window.GASGX_SITE_SHELL_CONFIG = window.GASGX_SITE_SHELL_CONFIG || {};

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
})();
