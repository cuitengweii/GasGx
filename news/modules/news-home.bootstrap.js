import { mountNewsMain, createNewsHomeApp } from './main.module.js';
import { mountSharedHeader, mountSharedFooter } from '../shared/modules/layout.shared.js';

function mountPageModules() {
    mountSharedHeader(document.getElementById('ggx-header-slot'), {
        page: 'news-home',
        idPrefix: 'ggx',
        appGlobal: 'GGXNewsHomeApp',
    });
    mountNewsMain(document.getElementById('ggx-main-slot'));
    mountSharedFooter(document.getElementById('ggx-footer-slot'), {
        variant: 'full',
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    mountPageModules();

    const app = createNewsHomeApp();
    window.GGXNewsHomeApp = app;

    await app.init();
});

