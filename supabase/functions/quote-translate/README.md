# `quote-translate` Deployment

This Edge Function is the secure server-side translation proxy for the quote editor.

It receives Chinese source fields from the real quote editor and returns EN / RU translations using XFYUN Spark.

## Required secrets

Set these function secrets in Supabase:

```text
XFYUN_SPARK_URL=
XFYUN_SPARK_APP_ID=
XFYUN_SPARK_API_KEY=
XFYUN_SPARK_API_SECRET=
```

Optional:

```text
XFYUN_SPARK_DOMAIN=generalv3.5
XFYUN_SPARK_TEMPERATURE=0.2
XFYUN_SPARK_MAX_TOKENS=2048
```

## Dashboard deploy

If Supabase CLI is unavailable locally, deploy from the Supabase Dashboard:

1. Open `Edge Functions`.
2. Create a new function named `quote-translate`.
3. Paste the code from:
   `supabase/functions/quote-translate/index.ts`
4. Save and deploy.
5. Add the required secrets above in the function settings.

## Local CLI deploy

When `supabase` CLI is available:

```powershell
supabase login
supabase link --project-ref mkpcliytqudclkwtewru
supabase secrets set `
  XFYUN_SPARK_URL="..." `
  XFYUN_SPARK_APP_ID="..." `
  XFYUN_SPARK_API_KEY="..." `
  XFYUN_SPARK_API_SECRET="..." `
  XFYUN_SPARK_DOMAIN="generalv3.5" `
  XFYUN_SPARK_TEMPERATURE="0.2" `
  XFYUN_SPARK_MAX_TOKENS="2048"
supabase functions deploy quote-translate --no-verify-jwt
```

## Verification

After deploy:

1. Open the real template editor.
2. Edit Chinese text only.
3. Click `自动生成 EN / RU` or `保存`.
4. Switch to `EN` / `RU`.
5. Confirm translated text is visible.

If the function is unavailable or Spark fails, the editor still saves and falls back to Chinese inheritance.
