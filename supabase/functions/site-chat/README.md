# site-chat

GasGx shared-site chatbot edge function backed by XFYUN Spark plus Supabase-hosted FAQ and knowledge retrieval.

## Required environment variables

```bash
XFYUN_SPARK_URL=
XFYUN_SPARK_APP_ID=
XFYUN_SPARK_API_KEY=
XFYUN_SPARK_API_SECRET=
XFYUN_SPARK_DOMAIN=generalv3.5
XFYUN_SPARK_TEMPERATURE=0.2
XFYUN_SPARK_MAX_TOKENS=2048
```

Optional:

```bash
XFYUN_SPARK_CHAT_SYSTEM_PROMPT=
```

Supabase built-in edge-function secrets used by the new retrieval path:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Deploy

`site-chat` is called by the public-site widget, so it must accept anonymous website traffic that only carries the publishable key headers from `site-shell.shared.js`.

Use:

```bash
supabase functions deploy site-chat --no-verify-jwt
```

Repo-local Supabase config also pins this behavior in:

```text
supabase/config.toml
```

## Request

```json
{
  "message": "What generator size fits a 1 MW mining load?",
  "sessionId": "gxchat_123",
  "language": "en",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi, how can I help?" }
  ],
  "pageContext": {
    "title": "GasGx products",
    "path": "/products/",
    "url": "https://www.gasgx.com/products/",
    "lang": "en"
  }
}
```

## Response

```json
{
  "ok": true,
  "provider": "gasgx_policy",
  "reply": "...",
  "language": "en",
  "sources": [
    {
      "title": "GasGx Offering Map",
      "url": "kb://gasgx/offering-overview",
      "source_type": "internal_sales_kb"
    }
  ],
  "handoff": {
    "required": false,
    "reason": "unknown",
    "next_fields": []
  }
}
```

## Provider semantics

- `gasgx_policy`: deterministic FAQ rule matched.
- `gasgx_rag`: response used knowledge retrieval, with Spark generation or a retrieval fallback.
- `xfyun_spark`: no stored knowledge/rule matched, Spark handled the turn directly.
