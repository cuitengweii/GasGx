import { mountFlashMain, createFlashApp } from './main.module.js?v=20260511flashfix01';
import { mountSharedHeader, mountSharedFooter } from '../../shared/modules/layout.shared.js?v=20260413authmenu03';

const STARTUP_TIMEOUT_MS = 8000;

function hideStartupMask() {
    const mask = document.getElementById('gxf-startup-mask');
    if (!mask) return;
    mask.classList.add('gxf-hidden');
    setTimeout(() => mask.remove(), 260);
}

function bindStartupRetry() {
    const retryBtn = document.getElementById('gxf-startup-retry');
    if (!retryBtn) return;
    retryBtn.addEventListener('click', () => {
        window.location.reload();
    });
}

function showStartupTimeoutState() {
    const mask = document.getElementById('gxf-startup-mask');
    const text = document.getElementById('gxf-startup-text');
    if (!mask || !text) return;
    mask.classList.add('gxf-timeout');
    text.textContent = 'Loading is taking longer than expected.';
}

function mountPageModules() {
    mountSharedHeader(document.getElementById('gxf-header-slot'), {
        page: 'flash',
        idPrefix: 'gxf',
        appGlobal: 'GGXFlashApp',
    });
    mountFlashMain(document.getElementById('gxf-main-slot'));
    mountSharedFooter(document.getElementById('gxf-footer-slot'), {
        variant: 'full',
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    bindStartupRetry();
    const startupTimeout = setTimeout(showStartupTimeoutState, STARTUP_TIMEOUT_MS);
    try {
        mountPageModules();

        const app = createFlashApp();
        window.GGXFlashApp = app;
        await app.init();
    } finally {
        clearTimeout(startupTimeout);
        hideStartupMask();
    }
});
