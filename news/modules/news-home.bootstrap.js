const STARTUP_TIMEOUT_MS = 8000;
const MAIN_MODULE_CANDIDATES = [
    './main.module.js?v=20260321newsacct01',
    './main.module.js?v=20260308video2',
    './main.module.js?v=20260308totop1',
    './main.module.js?v=20260308cover1',
    './main.module.js?v=20260305fix07',
    './main.module.js?v=20260305ams01',
    './main.module.js',
    '/news/modules/main.module.js?v=20260321newsacct01',
    '/news/modules/main.module.js?v=20260308video2',
    '/news/modules/main.module.js?v=20260308totop1',
    '/news/modules/main.module.js?v=20260308cover1',
    '/news/modules/main.module.js?v=20260305fix07',
    '/news/modules/main.module.js',
];
const LAYOUT_MODULE_CANDIDATES = [
    '../shared/modules/layout.shared.js?v=20260321newsacct01',
    '../shared/modules/layout.shared.js?v=20260308footer2',
    '../shared/modules/layout.shared.js?v=20260305fix07',
    '../shared/modules/layout.shared.js',
    '/news/shared/modules/layout.shared.js?v=20260321newsacct01',
    '/news/shared/modules/layout.shared.js?v=20260308footer2',
    '/news/shared/modules/layout.shared.js?v=20260305fix07',
    '/news/shared/modules/layout.shared.js',
];

function ensureStartupMask() {
    if (document.getElementById('ggx-startup-mask')) return;

    const style = document.createElement('style');
    style.id = 'ggx-startup-mask-style';
    style.textContent = `
        #ggx-startup-mask { position: fixed; inset: 0; z-index: 99999; display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; background: #050505; color: #cfcfcf; font-family: Inter, sans-serif; transition: opacity 220ms ease; }
        #ggx-startup-mask .ggx-row { display: flex; align-items: center; justify-content: center; }
        #ggx-startup-mask.ggx-hidden { opacity: 0; pointer-events: none; }
        #ggx-startup-mask .ggx-spinner { width: 34px; height: 34px; border: 2px solid rgba(255,255,255,0.15); border-top-color: #5DD62C; border-radius: 999px; animation: ggx-spin 0.9s linear infinite; margin-right: 12px; }
        #ggx-startup-retry { display: none; border: 1px solid rgba(255,255,255,0.2); background: #111111; color: #ffffff; padding: 8px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; }
        #ggx-startup-retry:hover { border-color: #5DD62C; color: #5DD62C; }
        #ggx-startup-mask.ggx-timeout #ggx-startup-retry { display: inline-flex; align-items: center; justify-content: center; }
        @keyframes ggx-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    const mask = document.createElement('div');
    mask.id = 'ggx-startup-mask';
    mask.setAttribute('role', 'status');
    mask.setAttribute('aria-live', 'polite');
    mask.setAttribute('aria-label', 'Loading news');
    mask.innerHTML = `
        <div class="ggx-row">
            <span class="ggx-spinner" aria-hidden="true"></span>
            <span id="ggx-startup-text">Loading News...</span>
        </div>
        <button id="ggx-startup-retry" type="button">Retry</button>
    `;
    document.body.appendChild(mask);
}

function bindStartupRetry() {
    const retryBtn = document.getElementById('ggx-startup-retry');
    if (!retryBtn) return;
    retryBtn.addEventListener('click', () => window.location.reload());
}

function showStartupTimeoutState() {
    const mask = document.getElementById('ggx-startup-mask');
    const text = document.getElementById('ggx-startup-text');
    if (!mask || !text) return;
    mask.classList.add('ggx-timeout');
    text.textContent = 'Loading is taking longer than expected.';
}

function hideStartupMask() {
    const mask = document.getElementById('ggx-startup-mask');
    if (!mask) return;
    mask.classList.add('ggx-hidden');
    setTimeout(() => mask.remove(), 260);
}

function renderBootstrapError(error) {
    const mainSlot = document.getElementById('ggx-main-slot');
    const message = String(error?.message || error || 'Unknown bootstrap error');
    if (mainSlot) {
        mainSlot.innerHTML = `
            <div style="max-width:980px;margin:48px auto;padding:18px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:#0f0f0f;color:#ddd;font-family:Inter,sans-serif;">
                <div style="font-weight:700;color:#ff7f7f;margin-bottom:8px;">News bootstrap failed</div>
                <div style="font-size:13px;line-height:1.5;word-break:break-word;">${message.replace(/</g, '&lt;')}</div>
                <div style="margin-top:12px;font-size:12px;color:#999;">Please hard refresh (Ctrl+Shift+R).</div>
            </div>
        `;
    }
}

async function importFirstAvailable(candidates = []) {
    let lastError = null;
    for (const spec of candidates) {
        try {
            return await import(spec);
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error('No module candidates provided');
}

async function resolveModules() {
    const [mainMod, layoutMod] = await Promise.all([importFirstAvailable(MAIN_MODULE_CANDIDATES), importFirstAvailable(LAYOUT_MODULE_CANDIDATES)]);

    if (typeof mainMod?.mountNewsMain !== 'function' || typeof mainMod?.createNewsHomeApp !== 'function') {
        throw new Error('main.module exports are invalid');
    }
    if (typeof layoutMod?.mountSharedHeader !== 'function' || typeof layoutMod?.mountSharedFooter !== 'function') {
        throw new Error('layout.shared exports are invalid');
    }

    return {
        mountNewsMain: mainMod.mountNewsMain,
        createNewsHomeApp: mainMod.createNewsHomeApp,
        mountSharedHeader: layoutMod.mountSharedHeader,
        mountSharedFooter: layoutMod.mountSharedFooter,
    };
}

function mountPageModules(api) {
    api.mountSharedHeader(document.getElementById('ggx-header-slot'), {
        page: 'news-home',
        idPrefix: 'ggx',
        appGlobal: 'GGXNewsHomeApp',
    });
    api.mountNewsMain(document.getElementById('ggx-main-slot'));
    api.mountSharedFooter(document.getElementById('ggx-footer-slot'), {
        variant: 'full',
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    ensureStartupMask();
    bindStartupRetry();
    const startupTimeout = setTimeout(showStartupTimeoutState, STARTUP_TIMEOUT_MS);
    try {
        const api = await resolveModules();
        mountPageModules(api);

        const app = api.createNewsHomeApp();
        window.GGXNewsHomeApp = app;
        await app.init();
    } catch (error) {
        console.error('[news bootstrap]', error);
        renderBootstrapError(error);
    } finally {
        clearTimeout(startupTimeout);
        hideStartupMask();
    }
});

