function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatInline(source) {
    let text = escapeHtml(source);
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return text;
}

export function markdownToHtml(markdown) {
    const lines = String(markdown || '').split(/\r?\n/);
    const html = [];
    let inList = false;
    let inCode = false;

    const closeList = () => {
        if (!inList) return;
        html.push('</ul>');
        inList = false;
    };

    for (const rawLine of lines) {
        const line = rawLine || '';

        if (line.trim().startsWith('```')) {
            closeList();
            if (inCode) {
                html.push('</pre>');
                inCode = false;
            } else {
                html.push('<pre><code>');
                inCode = true;
            }
            continue;
        }

        if (inCode) {
            html.push(`${escapeHtml(line)}\n`);
            continue;
        }

        const trimmed = line.trim();

        if (!trimmed) {
            closeList();
            continue;
        }

        if (/^###\s+/.test(trimmed)) {
            closeList();
            html.push(`<h3>${formatInline(trimmed.replace(/^###\s+/, ''))}</h3>`);
            continue;
        }
        if (/^##\s+/.test(trimmed)) {
            closeList();
            html.push(`<h2>${formatInline(trimmed.replace(/^##\s+/, ''))}</h2>`);
            continue;
        }
        if (/^#\s+/.test(trimmed)) {
            closeList();
            html.push(`<h1>${formatInline(trimmed.replace(/^#\s+/, ''))}</h1>`);
            continue;
        }

        if (/^[-*]\s+/.test(trimmed)) {
            if (!inList) {
                html.push('<ul>');
                inList = true;
            }
            html.push(`<li>${formatInline(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
            continue;
        }

        closeList();
        html.push(`<p>${formatInline(trimmed)}</p>`);
    }

    closeList();
    if (inCode) html.push('</code></pre>');
    return html.join('');
}

export function bindMarkdownPreview(textarea, previewEl) {
    if (!textarea || !previewEl) return () => {};

    const render = () => {
        const markdown = textarea.value || '';
        previewEl.innerHTML = markdownToHtml(markdown) || '<p class="ams-empty">Nothing to preview.</p>';
    };

    textarea.addEventListener('input', render);
    render();

    return () => textarea.removeEventListener('input', render);
}
