import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
};

const SPARK_TIMEOUT_MS = 25000;
const DEFAULT_DOMAIN = 'generalv3.5';
const SUPPORTED_TARGETS = new Set(['en', 'ru']);

type TranslateEntry = {
    key: string;
    text: string;
};

const GLOSSARY: Record<string, Record<string, string>> = {
    en: {
        '供应商': 'Supplier',
        '发件人': 'Sender',
        '收件人': 'Receiver',
        '报价有效期': 'Validity',
        '系统预估总价': 'Estimated System Total',
        '产品报价总览': 'Product Quotation Overview',
        '请输入客户名称': 'Enter customer name',
        '请输入客户邮箱': 'Please enter customer email',
        '发送': 'Send',
        '刷新汇率': 'Refresh Rates',
        '全球实时汇率在线': 'Live FX online',
        '主配置': 'Main Configuration',
        '选配': 'Optional Configuration',
        '系统配置': 'System Options',
        '基础发电机组': 'Basic GenSet',
        '直接改区块行 RMB 单元格，可覆盖小计。': 'Edit the RMB cell in the section row to override the subtotal.',
    },
    ru: {
        '供应商': 'Поставщик',
        '发件人': 'Отправитель',
        '收件人': 'Получатель',
        '报价有效期': 'Срок действия',
        '系统预估总价': 'Оценочная общая стоимость системы',
        '产品报价总览': 'Обзор коммерческого предложения',
        '请输入客户名称': 'Введите имя клиента',
        '请输入客户邮箱': 'Введите email клиента',
        '发送': 'Отправить',
        '刷新汇率': 'Обновить курс',
        '全球实时汇率在线': 'Онлайн-курс валют в реальном времени',
        '主配置': 'Основная конфигурация',
        '选配': 'Опции',
        '系统配置': 'Системные опции',
        '基础发电机组': 'Базовая генераторная установка',
        '直接改区块行 RMB 单元格，可覆盖小计。': 'Измените ячейку RMB в строке секции, чтобы переопределить промежуточный итог.',
    },
};

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback).trim();
}

function env(name: string, fallback = ''): string {
    return text(Deno.env.get(name), fallback);
}

function targetMeta(target: string) {
    if (target === 'en') {
        return {
            englishName: 'English',
            chineseName: '英文',
            sample: [
                { key: 'supplier', text: 'Supplier' },
                { key: 'receiver_placeholder', text: 'Please enter customer email' },
                { key: 'system_total', text: 'Estimated System Total' },
            ],
        };
    }
    return {
        englishName: 'Russian',
        chineseName: '俄语',
        sample: [
            { key: 'supplier', text: 'Поставщик' },
            { key: 'receiver_placeholder', text: 'Введите email клиента' },
            { key: 'system_total', text: 'Оценочная общая стоимость системы' },
        ],
    };
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
}

function utf8Base64(value: string): string {
    return bytesToBase64(new TextEncoder().encode(value));
}

async function hmacSha256(secret: string, value: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
    return bytesToBase64(new Uint8Array(signature));
}

async function createSparkAuthUrl(url: string, apiKey: string, apiSecret: string): Promise<string> {
    const parsed = new URL(url);
    const host = parsed.host;
    const path = parsed.pathname;
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signature = await hmacSha256(apiSecret, signatureOrigin);
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    parsed.searchParams.set('authorization', utf8Base64(authorizationOrigin));
    parsed.searchParams.set('date', date);
    parsed.searchParams.set('host', host);
    return parsed.toString();
}

function buildPrompt(target: string, entries: TranslateEntry[], strict = false): string {
    const meta = targetMeta(target);
    return [
        `你是燃气发电设备报价系统的专业翻译器。请把下面的中文字段翻译成${meta.chineseName}（${meta.englishName}）。`,
        '硬性规则：',
        `1. 最终 text 必须使用${meta.chineseName}，不能直接重复中文原文；只有产品型号、编码、邮箱、URL、货币代码、单位、品牌型号等字面量允许保留。`,
        '2. 报价业务语气要自然、正式，适合客户报价单页面。',
        '3. 不得漏翻任何条目。',
        '4. key 必须原样保留。',
        '5. 只能返回 JSON，格式固定为：{"translations":[{"key":"...","text":"..."}]}',
        '6. 不要输出解释，不要输出 Markdown 代码块。',
        strict
            ? `7. 如果某条结果仍然是中文，视为错误；请强制改写成${meta.chineseName}。`
            : '7. 如果输入是界面文案，请优先使用常见软件界面表达。',
        '',
        '示例输入输出：',
        JSON.stringify({
            translations: [
                { key: 'supplier', text: '供应商' },
                { key: 'receiver_placeholder', text: '请输入客户邮箱' },
                { key: 'system_total', text: '系统预估总价' },
            ],
        }, null, 2),
        JSON.stringify({ translations: meta.sample }, null, 2),
        '',
        '待翻译内容：',
        JSON.stringify({ translations: entries }, null, 2),
    ].join('\n');
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
    const value = text(raw);
    if (!value) return null;
    const stripped = value.startsWith('```') ? value.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim() : value;
    try {
        const parsed = JSON.parse(stripped);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
    } catch (_error) {
        const start = stripped.indexOf('{');
        const end = stripped.lastIndexOf('}');
        if (start < 0 || end <= start) return null;
        try {
            const parsed = JSON.parse(stripped.slice(start, end + 1));
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
        } catch (_error2) {
            return null;
        }
    }
}

async function chatWithSpark(prompt: string): Promise<string> {
    const url = env('XFYUN_SPARK_URL');
    const appId = env('XFYUN_SPARK_APP_ID');
    const apiKey = env('XFYUN_SPARK_API_KEY');
    const apiSecret = env('XFYUN_SPARK_API_SECRET');
    const domain = env('XFYUN_SPARK_DOMAIN', DEFAULT_DOMAIN);
    const temperature = Number(env('XFYUN_SPARK_TEMPERATURE', '0.2')) || 0.2;
    const maxTokens = Math.max(256, Number(env('XFYUN_SPARK_MAX_TOKENS', '2048')) || 2048);

    if (!url || !appId || !apiKey || !apiSecret) {
        throw new Error('xfyun_spark_env_missing');
    }

    const authUrl = await createSparkAuthUrl(url, apiKey, apiSecret);
    const payload = {
        header: { app_id: appId, uid: 'gasgx-quote-translate' },
        parameter: {
            chat: {
                domain,
                temperature,
                max_tokens: maxTokens,
            },
        },
        payload: {
            message: {
                text: [
                    {
                        role: 'system',
                        content: 'You are a professional quotation system translator. Output valid JSON only.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            },
        },
    };

    return await new Promise((resolve, reject) => {
        const socket = new WebSocket(authUrl);
        let response = '';
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            try {
                socket.close();
            } catch (_error) {
                // ignore
            }
            reject(new Error('spark_timeout'));
        }, SPARK_TIMEOUT_MS);

        socket.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(new Error('spark_socket_error'));
        };

        socket.onopen = () => {
            socket.send(JSON.stringify(payload));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(String(event.data || '{}'));
                const header = data?.header || {};
                const code = Number(header?.code || 0);
                if (code !== 0) {
                    throw new Error(`spark_code_${code}:${text(header?.message, '-')}`);
                }
                const choices = data?.payload?.choices || {};
                const textItems = Array.isArray(choices?.text) ? choices.text : [];
                if (textItems.length) {
                    response += text(textItems[0]?.content);
                }
                if (Number(choices?.status ?? 2) === 2) {
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        try {
                            socket.close();
                        } catch (_error) {
                            // ignore
                        }
                        resolve(text(response));
                    }
                }
            } catch (error) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                try {
                    socket.close();
                } catch (_error) {
                    // ignore
                }
                reject(error instanceof Error ? error : new Error('spark_parse_error'));
            }
        };
    });
}

function containsChinese(value: string) {
    return /[\u3400-\u9fff]/.test(value);
}

function normalizeTranslatedText(target: string, source: string, translated: string) {
    const sourceText = text(source);
    const current = text(translated);
    if (!current) return current;

    const glossaryValue = GLOSSARY[target]?.[sourceText];
    if (glossaryValue) return glossaryValue;

    if (target === 'en') {
        return current
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\bPleaseenter\b/g, 'Please enter')
            .replace(/\bEstimatedSystem\b/g, 'Estimated System')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    if (target === 'ru') {
        return current
            .replace(/Оценочнаяобщая/g, 'Оценочная общая')
            .replace(/курc/gi, 'курс')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    return current;
}

function translationLooksUnchanged(entries: TranslateEntry[], translated: Record<string, string>) {
    let chineseSources = 0;
    let unchangedChinese = 0;
    for (const entry of entries) {
        const source = text(entry.text);
        const result = text(translated[entry.key]);
        if (!containsChinese(source)) continue;
        chineseSources += 1;
        if (!result || result === source || containsChinese(result)) {
            unchangedChinese += 1;
        }
    }
    if (!chineseSources) return false;
    return unchangedChinese / chineseSources >= 0.6;
}

async function requestTranslations(target: string, entries: TranslateEntry[], strict = false) {
    const prompt = buildPrompt(target, entries, strict);
    const raw = await chatWithSpark(prompt);
    const parsed = parseJsonObject(raw);
    const translations = Array.isArray(parsed?.translations) ? parsed.translations : [];
    const byKey = new Map<string, string>();
    translations.forEach((entry) => {
        if (!entry || typeof entry !== 'object') return;
        const key = text((entry as Record<string, unknown>).key);
        const value = text((entry as Record<string, unknown>).text);
        if (key) byKey.set(key, value);
    });
    const result = Object.fromEntries(entries.map((entry) => [
        entry.key,
        normalizeTranslatedText(target, entry.text, byKey.get(entry.key) || entry.text),
    ]));

    return {
        raw,
        parsed,
        translations: result,
    };
}

async function translateEntries(target: string, entries: TranslateEntry[]) {
    const firstPass = await requestTranslations(target, entries, false);
    if (!translationLooksUnchanged(entries, firstPass.translations)) {
        return firstPass;
    }
    const secondPass = await requestTranslations(target, entries, true);
    return {
        ...secondPass,
        retried: true,
        firstPassRaw: firstPass.raw,
        firstPassParsed: firstPass.parsed,
        firstPassTranslations: firstPass.translations,
    };
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization') || '';
        const supabaseUrl = env('SUPABASE_URL');
        const supabaseAnonKey = env('SUPABASE_ANON_KEY');
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('supabase_env_missing');
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: userResult, error: userError } = await supabase.auth.getUser();
        if (userError || !userResult?.user?.email) {
            return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const { data: adminRow, error: adminError } = await supabase
            .from('admin_users')
            .select('email')
            .eq('email', userResult.user.email)
            .maybeSingle();
        if (adminError || !adminRow?.email) {
            return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });
        }

        const body = await req.json();
        const debug = body?.debug === true;
        const entries = Array.isArray(body?.entries)
            ? body.entries
                .map((entry: Record<string, unknown>) => ({
                    key: text(entry?.key),
                    text: text(entry?.text),
                }))
                .filter((entry: TranslateEntry) => entry.key && entry.text)
            : [];
        const targets = Array.isArray(body?.targets)
            ? body.targets.map((item: unknown) => text(item).toLowerCase()).filter((item: string) => SUPPORTED_TARGETS.has(item))
            : [];

        if (!entries.length || !targets.length) {
            return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400, headers: corsHeaders });
        }

        const uniqueEntries = entries.slice(0, 200);
        const translations: Record<string, Record<string, string>> = {};
        const debugPayload: Record<string, unknown> = {};
        for (const target of targets) {
            const result = await translateEntries(target, uniqueEntries);
            translations[target] = result.translations;
            if (debug) debugPayload[target] = result;
        }

        return new Response(JSON.stringify({ ok: true, provider: 'xfyun_spark', translations, debug: debug ? debugPayload : undefined }), {
            status: 200,
            headers: corsHeaders,
        });
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: 'translate_failed',
                message: error instanceof Error ? error.message : String(error),
            }),
            { status: 500, headers: corsHeaders },
        );
    }
});
