# Configuring Google Generative AI credentials for Tale Hue

This project calls Google Generative AI (Gemini) from a Next.js API route. The Generative API typically requires Application Default Credentials (ADC) or OAuth credentials rather than a plain API key. Follow one of the methods below to configure credentials locally or in production.

## Option A — Service account JSON (recommended for servers)
1. In Google Cloud Console, create a Service Account and grant the `Generative AI` (or relevant) permissions.
2. Create and download a JSON key for that service account.
3. On your server or dev machine, set the environment variable to the file path:

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/full/path/to/your/service-account.json"
   ```

   Or, if you prefer to store the JSON value in an environment variable (e.g., in CI), set `GOOGLE_APPLICATION_CREDENTIALS_JSON` to the full JSON string. The route will write this JSON to a temporary file and set `GOOGLE_APPLICATION_CREDENTIALS` automatically.

## Option B — Application Default Credentials (gcloud)
1. Install the `gcloud` CLI and run:

   ```bash
   gcloud auth application-default login
   ```

   That will populate ADC credentials that many Google client libraries will pick up automatically.

## Option C — Short-lived OAuth tokens or other mechanisms
If you need user-scoped OAuth, follow Google's OAuth flow and provide credentials accordingly. This app currently expects server-side service account/ADC for backend calls.

## Optional: GENAI_API_KEY
Some older or specific endpoints may accept `GENAI_API_KEY`. You can set:

```bash
export GENAI_API_KEY="YOUR_KEY_HERE"
```

But note: the Generative API often rejects API keys (see 401/AUTH errors). Prefer service accounts / ADC.

## Environment example
Create a `.env.local` (do NOT commit) with values like:

```text
# Path to service account JSON file
# GOOGLE_APPLICATION_CREDENTIALS=/home/you/.gcloud/service-account.json

# Or full JSON in env (the route will write it to a temp file automatically)
# GOOGLE_APPLICATION_CREDENTIALS_JSON={...}

# Optional: fallback API key
# GENAI_API_KEY=
```

After setting credentials, restart the Next server and retry image generation.
