# Deployment Guide - review.lornu.ai AI Pitch Deck

## Overview

This guide explains how the interactive AI pitch deck is deployed to `review.lornu.ai` and how Steven can manage deployments.

## Architecture

```
review.lornu.ai (proxied A record + Worker route on lornu.ai zone)
├── Worker Entry (src/worker.ts)
│   ├── POST /api/ask → AI handler (Workers AI binding)
│   └── Everything else → Static assets (ASSETS binding)
├── Static Assets (React SPA)
│   ├── Built from src/ via Vite
│   └── Served from dist/ by Workers Assets binding
└── Fallback: review-lornu-ai.principle-f1b.workers.dev
```

## Automatic Deployment (Recommended)

When you merge a PR to `main`:

1. **GitHub Actions** automatically triggers
2. Runs `npm run build` (type-check + Vite build)
3. Executes `wrangler deploy` to push to Cloudflare
4. The Worker updates at `review.lornu.ai`

**No manual steps required.** Just merge the PR.

## Manual Deployment (If Needed)

If you need to deploy manually (e.g., hotfix, bypass CI):

```bash
# From the repository root
npm run deploy
```

This command:
- Runs `tsc --noEmit` to type-check
- Builds production assets with `vite build` to `dist/`
- Deploys the Worker with `wrangler deploy`

**Prerequisites:**
- Wrangler must be authenticated: `npx wrangler login`
- You must have deploy permissions on the `lornu-ai` Cloudflare account

## Configuration Files

### wrangler.jsonc
```json
{
  "name": "review-lornu-ai",
  "compatibility_date": "2026-10-01",
  "main": "src/worker.ts",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application",
    "binding": "ASSETS"
  },
  "run_worker_first": ["/api/*"],
  "workers_dev": true,
  "preview_urls": false,
  "routes": [{ "pattern": "review.lornu.ai/*", "zone_name": "lornu.ai" }],
  "ai": {
    "binding": "AI"
  }
}
```

**Key settings:**
- `main`: Worker entry point that handles /api/ask and falls through to ASSETS
- `assets.binding`: Static assets available as env.ASSETS
- `assets.directory`: Serves built React app from `dist/`
- `run_worker_first`: API routes run through Worker before assets
- `workers_dev: true`: Fallback URL at review-lornu-ai.principle-f1b.workers.dev
- `preview_urls: false`: No preview URLs (security)
- `routes`: Zone route on lornu.ai (review.lornu.ai is a proxied A record)
- `ai.binding`: Enables Workers AI for `/api/ask` route

## AI Endpoint

### Route: POST /api/ask

**Request:**
```json
{
  "question": "What's the facility amount?"
}
```

**Response:**
```json
{
  "answer": "The facility amount is $1.25M, structured as an SBA 7(a) working capital loan."
}
```

**Features:**
- **Rate limiting**: 10 requests per minute per IP
- **Context-grounded**: Answers only from deck content
- **No API keys**: Uses Cloudflare Workers AI binding (built-in)
- **Model**: `@cf/meta/llama-3.1-8b-instruct` (temperature 0.3, max 512 tokens)

**Graceful degradation:**
- If Workers AI is unavailable, the deck remains fully functional
- Chat shows error message: "Unable to answer right now. The AI service may be temporarily unavailable."

## Security & Privacy

### No-Index Enforcement (Multi-Layer)

1. **HTML meta tag**: `<meta name="robots" content="noindex, nofollow">`
2. **HTTP header**: `X-Robots-Tag: noindex, nofollow, noarchive` (added by Worker on all responses)
3. **robots.txt**: `Disallow: /`

### Public Access

The site is publicly accessible at:
- Primary: `review.lornu.ai`
- Fallback: `review-lornu-ai.principle-f1b.workers.dev`

No authentication is required. The site relies on no-index enforcement and obscurity for confidentiality.

### Additional Headers

Served automatically via `public/_headers`:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: private, no-store
```

## Testing Deployment

After deployment, verify:

1. **Site loads**: Visit `review.lornu.ai` or `review-lornu-ai.principle-f1b.workers.dev` (publicly accessible)
2. **Deck navigation**: Arrow keys, slide numbers work
3. **DSCR toggle**: Switch between Conservative, Base, Upside scenarios
4. **Chat panel**: Click "Ask the memo", send a question
5. **No-index**: Check `<meta>` tag in source, verify `X-Robots-Tag` header

**Test questions for chat:**
- "What's the facility amount?"
- "What are the portfolio companies?"
- "What's the base case DSCR at month 12?"
- "How is the $1.25M allocated?"

## Troubleshooting

### Build fails
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check for missing dependencies
npm install
```

### Wrangler authentication issues
```bash
# Re-authenticate Wrangler
npx wrangler login

# Check logged-in account
npx wrangler whoami
```

### AI endpoint returns errors
- Workers AI is eventually consistent; may take ~1 minute after deployment
- Check Cloudflare dashboard → Workers & Pages → review-lornu-ai → Logs
- Rate limiting: 10 req/min per IP (wait 60s if exceeded)

### Site not accessible
- Verify DNS: `review.lornu.ai` should be a proxied A record
- Check Worker route: `review.lornu.ai/*` on zone `lornu.ai`
- Fallback URL: `review-lornu-ai.principle-f1b.workers.dev` should always work

## Rollback

If a deployment causes issues:

1. **Via Git**: Revert the commit and push to `main` (triggers auto-deploy)
2. **Via Wrangler**: Deploy a previous version manually:
   ```bash
   git checkout <previous-commit>
   npm run deploy
   ```

## Cost Notes

- **Workers AI**: Free tier includes 10,000 requests/day (Llama 3.1 8B)
- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **Custom domain**: No additional cost (already configured)

With 10 req/min rate limiting, typical usage should remain well within free tier.

## Support

For Cloudflare-related issues:
- Dashboard: https://dash.cloudflare.com
- Docs: https://developers.cloudflare.com/workers/

For code issues:
- GitHub: https://github.com/lornu-ai/review.lornu.ai
- PR review process: all changes require passing build + e2e tests
