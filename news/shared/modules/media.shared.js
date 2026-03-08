export const DEFAULT_COVER = '/news/advertisement/zhanwei.jpg';

export function resolveArticleMediaUrl(articleId, mediaPath, fallback = '') {
    const path = String(mediaPath || '').trim();
    if (!path) return fallback;
    if (/^https?:\/\//i.test(path)) return path;

    const normalized = path.replace(/^\.?\/*(images\/)?/i, '');
    if (articleId) return `https://www.gasgx.com/news/article/${articleId}/images/${normalized}`;
    return path.startsWith('/') ? path : `/${normalized}`;
}

export function isVideoMediaPath(value) {
    return /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?.*)?$/i.test(String(value || '').trim());
}

export function isImageMediaPath(value) {
    return /\.(avif|webp|png|jpe?g|gif|bmp|svg)(\?.*)?$/i.test(String(value || '').trim());
}

export function buildArticleAssetBaseUrl(articleUrl) {
    const base = String(articleUrl || '').trim();
    if (!base) return '';
    return base.endsWith('/') ? base : `${base}/`;
}

export function getInlineCoverMeta(item, articleId) {
    if (!item || typeof item !== 'object') return { url: '', isVideoCover: false };

    const videoFields = ['video_cover', 'video_cover_image', 'video_poster', 'video_thumbnail'];
    for (const field of videoFields) {
        const value = String(item[field] || '').trim();
        if (value) {
            const url = resolveArticleMediaUrl(articleId, value, '');
            return { url, isVideoCover: true };
        }
    }

    const genericFields = ['thumbnail', 'thumb', 'poster'];
    for (const field of genericFields) {
        const value = String(item[field] || '').trim();
        if (value) {
            const url = resolveArticleMediaUrl(articleId, value, '');
            return { url, isVideoCover: false };
        }
    }

    const link = String(item.link || '').trim();
    if (isImageMediaPath(link)) return { url: link, isVideoCover: false };
    if (isVideoMediaPath(link)) return { url: link, isVideoCover: true };

    return { url: '', isVideoCover: false };
}

export function getArticleMediaMeta(item, fallback = DEFAULT_COVER) {
    if (!item || typeof item !== 'object') return { url: fallback, isVideoCover: false };

    const articleId = item.app_id || item.api_id || item.id;
    const coverImage = String(item.cover_image || '').trim();
    if (coverImage) {
        const url = resolveArticleMediaUrl(articleId, coverImage, fallback);
        return { url, isVideoCover: isVideoMediaPath(url) };
    }

    const inline = getInlineCoverMeta(item, articleId);
    if (inline.url) return inline;

    return { url: fallback, isVideoCover: false };
}

export function extractCoverFromArticleHtml(html, articleUrl) {
    if (!html || typeof DOMParser === 'undefined') return { url: '', isVideoCover: false };

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const assetBaseUrl = buildArticleAssetBaseUrl(articleUrl);

        const videoElement = doc.querySelector('video');
        const videoPoster = videoElement?.getAttribute('poster');
        if (videoPoster) return { url: new URL(videoPoster, assetBaseUrl).href, isVideoCover: true };

        const videoSrc = videoElement?.getAttribute('src') || videoElement?.querySelector('source')?.getAttribute('src');
        if (videoSrc) return { url: new URL(videoSrc, assetBaseUrl).href, isVideoCover: true };

        const contentImage = doc.querySelector('.article-content img, article img')?.getAttribute('src');
        if (contentImage) return { url: new URL(contentImage, assetBaseUrl).href, isVideoCover: false };
    } catch (error) {
        console.warn('Failed to extract article cover from detail page:', error);
    }

    return { url: '', isVideoCover: false };
}
