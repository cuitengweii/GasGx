const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
};

const SPARK_TIMEOUT_MS = 45000;
const DEFAULT_DOMAIN = 'generalv3.5';
const DEFAULT_SYSTEM_PROMPT = [
    'You are GasGx Assistant.',
    'Focus on natural gas generators, gas power systems, mining power supply, product selection, deployment, maintenance, and commercial pre-sales guidance.',
    'Be concise, practical, and honest.',
    'If the user asks for unavailable pricing or site-specific data, say what is missing and suggest the next useful step.',
    'Do not invent contracts, inventory, certifications, or lead times.',
].join(' ');

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback).trim();
}

function env(name: string, fallback = ''): string {
    return text(Deno.env.get(name), fallback);
}

function json(data: Record<string, unknown>, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: corsHeaders,
    });
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

async function chatWithSpark(message: string, systemPrompt: string): Promise<string> {
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
        header: { app_id: appId, uid: 'gasgx-site-chat' },
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
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
            },
        },
    };

    return await new Promise<string>((resolve, reject) => {
        let settled = false;
        let chunks = '';
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            try { socket.close(); } catch (_error) {}
            reject(new Error('spark_timeout'));
        }, SPARK_TIMEOUT_MS);

        const socket = new WebSocket(authUrl);

        socket.onopen = () => {
            socket.send(JSON.stringify(payload));
        };

        socket.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            reject(new Error('spark_socket_error'));
        };

        socket.onmessage = (event) => {
            try {
                const packet = JSON.parse(text(event.data));
                const header = packet?.header || {};
                const code = Number(header?.code ?? 0);
                if (code !== 0) {
                    throw new Error(`spark_code_${code}:${text(header?.message, '-')}`);
                }

                const choices = packet?.payload?.choices;
                const status = Number(choices?.status ?? -1);
                const parts = Array.isArray(choices?.text) ? choices.text : [];
                for (const item of parts) {
                    const content = text(item?.content);
                    if (content) chunks += content;
                }

                if (status === 2) {
                    if (!settled) {
                        settled = true;
                        clearTimeout(timer);
                        socket.close();
                        resolve(chunks.trim());
                    }
                }
            } catch (error) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                try { socket.close(); } catch (_error) {}
                reject(error instanceof Error ? error : new Error('spark_parse_error'));
            }
        };

        socket.onclose = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (chunks.trim()) {
                resolve(chunks.trim());
            } else {
                reject(new Error('spark_closed_without_reply'));
            }
        };
    });
}

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return json({ ok: false, error: 'method_not_allowed' }, 405);
    }

    try {
        const payload = await request.json().catch(() => ({}));
        const message = text(payload?.message);
        const systemPrompt = text(payload?.systemPrompt, env('XFYUN_SPARK_CHAT_SYSTEM_PROMPT', DEFAULT_SYSTEM_PROMPT));

        if (!message) {
            return json({ ok: false, error: 'message_required' }, 400);
        }

        const reply = await chatWithSpark(message, systemPrompt);
        return json({ ok: true, provider: 'xfyun_spark', reply });
    } catch (error) {
        console.error('site-chat error', error);
        return json({
            ok: false,
            error: error instanceof Error ? error.message : 'unknown_error',
        }, 500);
    }
});
