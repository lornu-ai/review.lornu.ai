# review.lornu.ai

Lornuai's interactive commercial credit review: a nine-slide memorandum for the $1.25M SBA 7(a) working capital facility with an AI-powered Q&A chat panel. Built with React 19, TypeScript, Tailwind CSS 4, Vite, bun, and Cloudflare Workers AI.

**Public site** with no-index enforcement. The site sends `noindex` and `no-store` headers, has robots.txt disallow, and is available at both `review.lornu.ai` and the fallback `review-lornu-ai.principle-f1b.workers.dev`.

## Features

- **Nine-slide credit memorandum**: Thesis, Market, Engine, Portfolio, Economics, Capital, Coverage (with interactive DSCR scenarios), Roadmap, and Close
- **AI chat panel**: "Ask the memo" feature powered by Cloudflare Workers AI (Llama 3.1 8B Instruct) - answers grounded in deck content only
- **Responsive design**: Optimized for laptop and mobile with keyboard navigation
- **No-index enforcement**: Robots meta tag, X-Robots-Tag header, and robots.txt disallow
- **Graceful degradation**: Deck functions normally if AI service is unavailable

| Path | What it is |
|---|---|
| `src/App.tsx` | The deck + AI chat panel UI |
| `src/worker.ts` | Worker entry point: handles /api/ask with AI binding, falls through to ASSETS for static files |
| `src/index.css` | Tailwind import and the deck's styles (Playfair Display + Inter fonts, lornu.ai navy/gold palette) |
| `public/_headers` | Security and no-index headers for every response |
| `public/robots.txt` | Disallow all robots |
| `e2e/` | Playwright tests on desktop Chrome and iPhone Safari |
| `wrangler.jsonc` | `review-lornu-ai` Worker: static assets + API route + AI binding, zone route on lornu.ai |

## Run

```bash
bun install
bun run dev                 # http://127.0.0.1:5173
bun run build               # type check, then build to dist/
bun run test:e2e            # builds, serves on :4173, runs Playwright
```

Keys: right arrow or space for next, left arrow for previous, Escape closes the overview or chat panel. The "Ask the memo" button opens the AI chat panel.

## Publish

`bun run deploy` builds and deploys the `review-lornu-ai` Worker with Wrangler. The site is publicly accessible at `review.lornu.ai` and the fallback URL `review-lornu-ai.principle-f1b.workers.dev`.

**Workers AI binding**: The Worker uses Cloudflare Workers AI (no external API keys required). The AI binding is configured in `wrangler.jsonc` and powers the `/api/ask` route.

## AI Chat Features

- **Context-grounded**: Only answers from the deck content (facility amount, DSCR projections, portfolio companies, use of funds, SOP 50 10 8.1 compliance, etc.)
- **Rate limiting**: 10 requests per minute per IP
- **Disclaimer**: Reminds users that figures are projections, not guarantees
- **Graceful failure**: Shows error message if AI service is temporarily unavailable

## Checks

Every pull request runs `build`, `e2e`, `gitleaks`, and `workflows` (actionlint); all four are required on `main`.

