(function initQuotePublicAssetVersion() {
    const version = '20260329public78';
    window.AMS_QUOTE_PUBLIC_ASSET_VERSION = version;
    window.AMSLoadQuotePublicStyles = function loadQuotePublicStyles(href) {
        if (!href) return;
        const targetHref = `${href}?v=${version}`;
        const existing = document.querySelector(`link[data-quote-public-asset="${href}"]`);
        if (existing) {
            existing.setAttribute('href', targetHref);
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = targetHref;
        link.setAttribute('data-quote-public-asset', href);
        document.head.appendChild(link);
    };
    window.AMSLoadQuotePublicModule = function loadQuotePublicModule(src) {
        if (!src) return;
        const targetSrc = `${src}?v=${version}`;
        const script = document.createElement('script');
        script.type = 'module';
        script.src = targetSrc;
        document.body.appendChild(script);
    };
}());
