import { mountSharedHeader, mountSharedFooter } from '../../shared/modules/layout.shared.js?v=20260412authsync01';
import { mountChannelMain, createChannelApp } from '../../shared/modules/channel-page.shared.js?v=20260412authsync01';

const STARTUP_TIMEOUT_MS = 8000;

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
    mask.setAttribute('aria-label', 'Loading channel news');
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

const CHANNEL_KEY = 'mining';

function mountPageModules() {
    mountSharedHeader(document.getElementById('ggx-header-slot'), {
        page: 'news-home',
        idPrefix: 'ggx',
        appGlobal: 'GGXChannelApp',
    });
    mountChannelMain(document.getElementById('ggx-main-slot'), CHANNEL_KEY);
    mountSharedFooter(document.getElementById('ggx-footer-slot'), {
        variant: 'full',
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    ensureStartupMask();
    bindStartupRetry();
    const startupTimeout = setTimeout(showStartupTimeoutState, STARTUP_TIMEOUT_MS);
    try {
        mountPageModules();

        const app = createChannelApp(CHANNEL_KEY);
        window.GGXChannelApp = app;

        await app.init();
    } finally {
        clearTimeout(startupTimeout);
        hideStartupMask();
    }
});
