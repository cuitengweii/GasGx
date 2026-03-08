import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ENTRY_HTML = [
    'news/index.html',
    'news/gas-energy/index.html',
    'news/generators/index.html',
    'news/mining/index.html',
    'news/insights/index.html',
    'news/data/index.html',
    'news/events/index.html',
    'article_management/index.html',
];
const ENTRY_MODULES = [
    'news/modules/news-home.bootstrap.js',
    'news/gas-energy/modules/channel.bootstrap.js',
    'news/generators/modules/channel.bootstrap.js',
    'news/mining/modules/channel.bootstrap.js',
    'news/insights/modules/channel.bootstrap.js',
    'news/data/modules/channel.bootstrap.js',
    'news/events/modules/channel.bootstrap.js',
    'article_management/modules/app.bootstrap.js',
];
const JS_EXTS = ['.js', '.mjs', '.cjs'];

let hasFailure = false;
let warningCount = 0;

function fail(message) {
    hasFailure = true;
    console.error(`[FAIL] ${message}`);
}

function warn(message) {
    warningCount += 1;
    console.warn(`[WARN] ${message}`);
}

function ok(message) {
    console.log(`[OK] ${message}`);
}

function stripQuery(specifier) {
    return String(specifier || '').split('?')[0].split('#')[0];
}

function isLocalSpecifier(specifier) {
    return specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/');
}

function resolveLocalSpecifier(fromFileAbs, specifier) {
    const clean = stripQuery(specifier);
    if (!isLocalSpecifier(clean)) return null;

    if (clean.startsWith('/')) return path.join(ROOT, clean.slice(1));
    return path.resolve(path.dirname(fromFileAbs), clean);
}

function existsFileWithExtension(absPathNoExt) {
    if (fs.existsSync(absPathNoExt) && fs.statSync(absPathNoExt).isFile()) return absPathNoExt;
    for (const ext of JS_EXTS) {
        const candidate = `${absPathNoExt}${ext}`;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
}

function parseNamedImports(clause) {
    const text = String(clause || '');
    const braceStart = text.indexOf('{');
    const braceEnd = text.indexOf('}');
    if (braceStart < 0 || braceEnd < 0 || braceEnd <= braceStart) return [];

    const inside = text.slice(braceStart + 1, braceEnd).trim();
    if (!inside) return [];

    return inside
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const [raw] = part.split(/\s+as\s+/i);
            return raw ? raw.trim() : '';
        })
        .filter(Boolean);
}

function collectExports(source) {
    const exports = new Set();
    let exportStar = false;

    const directRe = /^\s*export\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm;
    let m = null;
    while ((m = directRe.exec(source))) exports.add(m[1]);

    const listRe = /^\s*export\s*\{([^}]+)\}/gm;
    while ((m = listRe.exec(source))) {
        const body = m[1] || '';
        body.split(',').forEach((chunk) => {
            const token = chunk.trim();
            if (!token) return;
            const left = token.split(/\s+as\s+/i)[0]?.trim();
            if (left) exports.add(left);
        });
    }

    const exportAllRe = /^\s*export\s+\*\s+from\s+['"][^'"]+['"]/gm;
    if (exportAllRe.test(source)) exportStar = true;

    return { exports, exportStar };
}

function parseImports(source) {
    const imports = [];
    let m = null;

    const staticRe = /^\s*import\s+([^'";]+?)\s+from\s+['"]([^'"]+)['"]/gm;
    while ((m = staticRe.exec(source))) {
        imports.push({
            type: 'static',
            clause: m[1].trim(),
            specifier: m[2],
            named: parseNamedImports(m[1]),
            namespace: /\*\s+as\s+/.test(m[1]),
        });
    }

    const sideEffectRe = /^\s*import\s+['"]([^'"]+)['"]/gm;
    while ((m = sideEffectRe.exec(source))) {
        imports.push({
            type: 'side-effect',
            clause: '',
            specifier: m[1],
            named: [],
            namespace: false,
        });
    }

    const dynamicRe = /import\(\s*['"]([^'"]+)['"]\s*\)/gm;
    while ((m = dynamicRe.exec(source))) {
        imports.push({
            type: 'dynamic',
            clause: '',
            specifier: m[1],
            named: [],
            namespace: false,
        });
    }

    return imports;
}

const moduleCache = new Map();

function scanModule(absFile) {
    if (moduleCache.has(absFile)) return moduleCache.get(absFile);

    if (!fs.existsSync(absFile)) {
        fail(`Module file missing: ${path.relative(ROOT, absFile)}`);
        const missing = { file: absFile, imports: [], exports: new Set(), exportStar: false };
        moduleCache.set(absFile, missing);
        return missing;
    }

    const source = fs.readFileSync(absFile, 'utf8');
    const imports = parseImports(source);
    const { exports, exportStar } = collectExports(source);
    const record = { file: absFile, imports, exports, exportStar };
    moduleCache.set(absFile, record);

    for (const item of imports) {
        if (!isLocalSpecifier(item.specifier)) continue;
        const resolvedNoExt = resolveLocalSpecifier(absFile, item.specifier);
        const resolved = existsFileWithExtension(resolvedNoExt) || resolvedNoExt;
        scanModule(resolved);
    }

    return record;
}

function verifyModuleGraph(entryRel) {
    const entryAbs = path.join(ROOT, entryRel);
    const entry = scanModule(entryAbs);
    ok(`Scanned module graph from ${entryRel}`);

    for (const record of moduleCache.values()) {
        for (const item of record.imports) {
            if (!isLocalSpecifier(item.specifier)) continue;
            const resolvedNoExt = resolveLocalSpecifier(record.file, item.specifier);
            const resolved = existsFileWithExtension(resolvedNoExt);

            if (!resolved) {
                fail(`Import not found: ${path.relative(ROOT, record.file)} -> ${item.specifier}`);
                continue;
            }

            if (item.specifier.includes('?v=')) {
                warn(`Version query in internal import: ${path.relative(ROOT, record.file)} -> ${item.specifier}`);
            }

            if (item.type !== 'static' || item.namespace || item.named.length === 0) continue;

            const target = moduleCache.get(resolved) || scanModule(resolved);
            if (target.exportStar) continue;

            for (const name of item.named) {
                if (!target.exports.has(name)) {
                    fail(
                        `Missing export "${name}": ${path.relative(ROOT, record.file)} imports from ${path.relative(ROOT, resolved)}`
                    );
                }
            }
        }
    }

    // Keep a local touchpoint for entry so variable is used and explicit.
    if (!entry || !entry.file) fail(`Failed to scan entry module: ${entryRel}`);
}

function verifyHtmlAssets(htmlRel) {
    const htmlAbs = path.join(ROOT, htmlRel);
    if (!fs.existsSync(htmlAbs)) {
        fail(`HTML file missing: ${htmlRel}`);
        return;
    }

    const html = fs.readFileSync(htmlAbs, 'utf8');
    const refs = [];
    let m = null;

    const srcRe = /\s(?:src)=["']([^"']+)["']/g;
    while ((m = srcRe.exec(html))) refs.push(m[1]);

    const hrefRe = /\s(?:href)=["']([^"']+)["']/g;
    while ((m = hrefRe.exec(html))) refs.push(m[1]);

    let checked = 0;
    for (const ref of refs) {
        const stripped = stripQuery(ref).trim();
        if (!stripped) continue;
        if (/^(https?:)?\/\//i.test(stripped)) continue;
        if (stripped.startsWith('data:')) continue;

        const abs = stripped.startsWith('/')
            ? path.join(ROOT, stripped.slice(1))
            : path.resolve(path.dirname(htmlAbs), stripped);
        if (!fs.existsSync(abs)) {
            fail(`Missing asset in HTML: ${htmlRel} -> ${ref}`);
        } else {
            checked += 1;
        }
    }

    ok(`HTML asset references verified for ${htmlRel} (${checked} local refs)`);
}

function main() {
    moduleCache.clear();
    ENTRY_HTML.forEach(verifyHtmlAssets);
    ENTRY_MODULES.forEach(verifyModuleGraph);

    if (hasFailure) {
        console.error('\nSmoke check failed.');
        process.exit(1);
    }

    console.log(`\nSmoke check passed.${warningCount ? ` Warnings: ${warningCount}` : ''}`);
}

main();
