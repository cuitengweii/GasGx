import { mountFlashMain, createFlashApp } from './main.module.js';
import { mountSharedHeader, mountSharedFooter } from '../../shared/modules/layout.shared.js';

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
    mountPageModules();

    const app = createFlashApp();
    window.GGXFlashApp = app;

    await app.init();
});
