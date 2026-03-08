import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const MAIN_MODULE = path.join(ROOT, 'news/modules/main.module.js');
const CHANNEL_MODULE = path.join(ROOT, 'news/shared/modules/channel-page.shared.js');
const SHARED_MEDIA_MODULE = path.join(ROOT, 'news/shared/modules/media.shared.js');

function ok(message) {
    console.log(`[OK] ${message}`);
}

function findTag(html, tagName) {
    const source = String(html || '');
    const pairRe = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'i');
    const pairMatch = source.match(pairRe);
    if (pairMatch) return createElement(tagName, pairMatch[1] || '', pairMatch[2] || '');

    const selfClosingRe = new RegExp(`<${tagName}\\b([^>]*)\\/?>`, 'i');
    const selfClosingMatch = source.match(selfClosingRe);
    if (selfClosingMatch) return createElement(tagName, selfClosingMatch[1] || '', '');

    return null;
}

function parseAttributes(fragment) {
    const attrs = {};
    String(fragment || '').replace(/([:@\w-]+)\s*=\s*(["'])(.*?)\2/g, (_m, name, _q, value) => {
        attrs[name] = value;
        return '';
    });
    return attrs;
}

function createElement(tagName, attrFragment, innerHtml) {
    const attrs = parseAttributes(attrFragment);
    return {
        tagName: String(tagName || '').toUpperCase(),
        innerHTML: innerHtml || '',
        getAttribute(name) {
            return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
        },
        querySelector(selector) {
            return querySelector(innerHtml, selector);
        },
    };
}

function querySelector(html, selector) {
    const selectors = String(selector || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    for (const current of selectors) {
        if (current === '.article-content video') {
            const articleContentIndex = String(html || '').search(/class=(["'])[^"']*article-content[^"']*\1/i);
            if (articleContentIndex >= 0) {
                const scopedHtml = String(html || '').slice(articleContentIndex);
                const video = findTag(scopedHtml, 'video');
                if (video) return video;
            }
        }

        if (current === '.article-content img') {
            const articleContentIndex = String(html || '').search(/class=(["'])[^"']*article-content[^"']*\1/i);
            if (articleContentIndex >= 0) {
                const scopedHtml = String(html || '').slice(articleContentIndex);
                const image = findTag(scopedHtml, 'img');
                if (image) return image;
            }
        }

        if (current === 'video') {
            const video = findTag(html, 'video');
            if (video) return video;
        }

        if (current === 'source') {
            const sourceTag = findTag(html, 'source');
            if (sourceTag) return sourceTag;
        }

        if (current === '.article-content img' || current === 'article img') {
            const image = findTag(html, 'img');
            if (image) return image;
        }
    }

    return null;
}

class FakeDOMParser {
    parseFromString(html) {
        return {
            querySelector(selector) {
                return querySelector(html, selector);
            },
        };
    }
}

async function loadSharedMediaModule() {
    const source = fs.readFileSync(SHARED_MEDIA_MODULE, 'utf8');
    const transformed = `${source
        .replace(/export const /g, 'const ')
        .replace(/export function /g, 'function ')}
globalThis.__GGX_MEDIA_EXPORTS__ = {
    DEFAULT_COVER,
    resolveArticleMediaUrl,
    isVideoMediaPath,
    isImageMediaPath,
    buildArticleAssetBaseUrl,
    getInlineCoverMeta,
    getArticleMediaMeta,
    extractCoverFromArticleHtml,
};`;
    const context = vm.createContext({
        console,
        DOMParser: FakeDOMParser,
        URL,
        globalThis: {},
    });
    context.globalThis = context;
    vm.runInContext(transformed, context, { filename: SHARED_MEDIA_MODULE });
    return context.__GGX_MEDIA_EXPORTS__;
}

function verifySharedImport() {
    const mainSource = fs.readFileSync(MAIN_MODULE, 'utf8');
    const channelSource = fs.readFileSync(CHANNEL_MODULE, 'utf8');
    const sharedSource = fs.readFileSync(SHARED_MEDIA_MODULE, 'utf8');

    assert.match(mainSource, /media\.shared\.js/, 'Homepage module must import media.shared.js');
    assert.match(channelSource, /media\.shared\.js/, 'Channel module must import media.shared.js');
    assert.match(mainSource, /!isVideoMediaPath\(imageUrl\)/, 'Homepage image updates must guard against raw video URLs');
    assert.match(sharedSource, /buildArticleAssetBaseUrl/, 'Shared media helper must expose article asset base normalization');
    ok('Homepage and channel pages are wired to the shared media helper');
}

async function verifySharedMediaBehavior() {
    const media = await loadSharedMediaModule();
    const normalize = (value) => JSON.parse(JSON.stringify(value));

    const relativeImage = normalize(media.extractCoverFromArticleHtml(
        '<div class="article-content"><img src="images/sample-cover.jpg" alt=""></div>',
        'https://www.gasgx.com/news/article/2284'
    ));
    const relativeVideo = normalize(media.extractCoverFromArticleHtml(
        '<div class="article-content"><video><source src="images/sample-video.mp4" type="video/mp4"></video></div>',
        'https://www.gasgx.com/news/article/2282'
    ));
    const posterVideo = normalize(media.extractCoverFromArticleHtml(
        '<div class="article-content"><video poster="https://media.licdn.com/dms/image/v2/poster.jpg"><source src="https://dms.licdn.com/video.mp4" type="video/mp4"></video></div>',
        'https://www.gasgx.com/news/article/2282'
    ));
    const avatarBeforeContent = normalize(media.extractCoverFromArticleHtml(
        '<article><header><img src="images/author-avatar.png" alt="Author avatar"></header><div class="article-content"><img src="images/real-cover.jpg" alt="Real cover"></div></article>',
        'https://www.gasgx.com/news/article/2284'
    ));
    const inlinePoster = normalize(media.getInlineCoverMeta({ video_poster: 'images/poster.jpg' }, 2282));
    const inlineVideoLink = normalize(media.getInlineCoverMeta({ link: 'https://cdn.example.com/demo.mp4' }, 2282));
    const coverImage = normalize(media.getArticleMediaMeta({ api_id: 2284, cover_image: 'images/sample-cover.jpg' }));
    const bareCoverImage = normalize(media.getArticleMediaMeta({ api_id: 2284, cover_image: 'sample-cover.jpg' }));
    const assetBase = media.buildArticleAssetBaseUrl('https://www.gasgx.com/news/article/2284');

    assert.deepEqual(relativeImage, {
        url: 'https://www.gasgx.com/news/article/2284/images/sample-cover.jpg',
        isVideoCover: false,
    });
    assert.deepEqual(relativeVideo, {
        url: 'https://www.gasgx.com/news/article/2282/images/sample-video.mp4',
        isVideoCover: true,
    });
    assert.deepEqual(posterVideo, {
        url: 'https://media.licdn.com/dms/image/v2/poster.jpg',
        isVideoCover: true,
    });
    assert.deepEqual(avatarBeforeContent, {
        url: 'https://www.gasgx.com/news/article/2284/images/real-cover.jpg',
        isVideoCover: false,
    });
    assert.deepEqual(inlinePoster, {
        url: 'https://www.gasgx.com/news/article/2282/images/poster.jpg',
        isVideoCover: true,
    });
    assert.deepEqual(inlineVideoLink, {
        url: 'https://cdn.example.com/demo.mp4',
        isVideoCover: true,
    });
    assert.deepEqual(coverImage, {
        url: 'https://www.gasgx.com/news/article/2284/images/sample-cover.jpg',
        isVideoCover: false,
    });
    assert.deepEqual(bareCoverImage, {
        url: 'https://www.gasgx.com/news/article/2284/images/sample-cover.jpg',
        isVideoCover: false,
    });
    assert.equal(assetBase, 'https://www.gasgx.com/news/article/2284/');
    ok('Shared media helper passes image/video regression fixtures');
}

async function main() {
    verifySharedImport();
    await verifySharedMediaBehavior();
}

main().catch((error) => {
    console.error(`[FAIL] ${error?.stack || error}`);
    process.exitCode = 1;
});
