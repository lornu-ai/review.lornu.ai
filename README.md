# review.lornu.ai

Lornuai's interactive commercial credit review: a nine-slide memorandum for the $1.25M SBA 7(a) working capital facility. Built from the Figma Make export with React 19, TypeScript, Tailwind CSS 4, Vite, and bun.

**Confidential.** The site is served only behind Cloudflare Access on `review.lornu.ai`. It sends `noindex` and `no-store` headers, and the Worker has no `workers.dev` or preview address.

| Path | What it is |
|---|---|
| `src/App.tsx` | The deck: chapters, scenario model, overview |
| `src/index.css` | Tailwind import and the deck's styles |
| `public/_headers` | Security and no-index headers for every response |
| `e2e/` | Playwright tests on desktop Chrome and iPhone Safari |
| `wrangler.jsonc` | `review-lornu-ai` Worker: static assets only, custom domain `review.lornu.ai` |

## Run

```bash
bun install
bun run dev                 # http://127.0.0.1:5173
bun run build               # type check, then build to dist/
bun run test:e2e            # builds, serves on :4173, runs Playwright
```

Keys: right arrow or space for next, left arrow for previous, Escape closes the overview. Below 1050px the closing figures and restart button are hidden by design; phones move with the arrows or the overview.

## Publish

`bun run deploy` builds and deploys the `review-lornu-ai` Worker with Wrangler. Cloudflare Access on `review.lornu.ai` must exist first; reviewers are added to its policy by email.

## Checks

Every pull request runs `build`, `e2e`, `gitleaks`, and `workflows` (actionlint); all four are required on `main`.
