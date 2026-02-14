import { mountSharedHeader, mountSharedFooter } from '../../shared/modules/layout.shared.js';
import { mountChannelMain, createChannelApp } from '../../shared/modules/channel-page.shared.js';

const CHANNEL_KEY = 'gas-energy';

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
    mountPageModules();

    const app = createChannelApp(CHANNEL_KEY);
    window.GGXChannelApp = app;

    await app.init();
});
