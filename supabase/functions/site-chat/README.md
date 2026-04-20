# site-chat

GasGx shared-site chatbot edge function backed by XFYUN Spark.

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

## Request

```json
{
  "message": "What generator size fits a 1 MW mining load?"
}
```

## Response

```json
{
  "ok": true,
  "provider": "xfyun_spark",
  "reply": "..."
}
```
