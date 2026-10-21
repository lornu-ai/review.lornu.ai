export interface Env {
  AI: Ai
}

const DECK_CONTEXT = `
Lornuai Credit Memorandum - $1.25M SBA 7(a) Working Capital Facility

FACILITY REQUEST:
- Amount: $1.25M
- Structure: SBA 7(a) working capital
- Purpose: Elite engineering talent and go-to-market systems
- Borrower: Lornuai, Inc. (Delaware C-Corp, Pflugerville, Texas)
- Recipient: J.P. Morgan Innovation Economy
- Seed Round: $3.0M SAFE at $25M post-money cap (planned for month 12)

INVESTMENT THESIS:
Lornuai builds the infrastructure that makes autonomous AI work. Legacy infrastructure was built for human-speed software. Autonomous agents now create, test, and deploy at machine speed. The control plane beneath them has not caught up.

MARKET:
- Serviceable market: $12.2B (AI-native engineering substrates and AgentOps)
- Lornu architecture: 500+ parallel agent capacity vs 10-20 for competitors
- Fast Free Testing: <1 second vs 10-30 minutes for legacy verification

OPERATING MODEL (Startup Engine, Not a Fund):
1. Discover: Find the missing layer beneath fast-growing AI workflows
2. Co-found: Pair technical founders with shared capital and operating leverage
3. Co-build: Deploy product, engineering, cloud, and go-to-market talent
4. Scale: Graduate a revenue-ready company with an institutional narrative

Portfolio: 6 companies, 3 active co-builds, 18-month seed-to-A timeline, 100% AI-native

PORTFOLIO COMPANIES (Four Commercial Surfaces):
1. AIVCS - Sovereign AI version control
   - Metric: $180K+ enterprise ACV
   - Description: Content-addressable substrate for hundreds of autonomous coding agents

2. Kilokind - AI infrastructure optimization
   - Metric: 72% lower task cost
   - Description: Routes each task to the most efficient model while preserving quality

3. Lone Star Ledgers - Autonomous financial ops
   - Metric: $575 blended monthly ARPU
   - Description: Domestic, AI-powered bookkeeping for Central Texas operators

4. Sovereign Exec - Executive talent orchestration
   - Metric: 5% success fee
   - Description: High-touch, AI-native representation for senior technology leaders

Co-built ecosystem: Inference Labs, Cartographer, Grounded, Synthex, Recall, Prism

REVENUE MODEL (Open-Core):
- Community (Free): CLI, local CAS, five private repos
- Teams ($29-39/seat): Orchestration, unlimited repos, FFT
- Enterprise ($180K+/cluster): Air-gapped mesh, custom builders, SLA
- Projected gross margin: 84.2%
- Ledger clients at operating break-even: 25
- Enterprise contract motion: Direct

USE OF FUNDS (12-Month Deployment):
- $850K (68%): Elite engineering payroll
- $120K (9.6%): Recruitment + incentives
- $105K (8.4%): Cloud + AI compute
- $85K (6.8%): Developer acquisition
- $75K (6.0%): Contingency reserve
- $15K (1.2%): Compliance + finance

4 foundational hires: Lead Rust, Distributed Systems, AI/ML Evals, DevSecOps

DSCR PROJECTIONS (Three Scenarios):
Conservative:
- Year 2 ARR: $1.8M
- Month 12 DSCR: 1.31×
- Ledger clients: 18
- Monthly DSCR path: 0.52, 0.61, 0.69, 0.78, 0.87, 0.96, 1.06, 1.15, 1.23, 1.27, 1.29, 1.31

Base case:
- Year 2 ARR: $2.7M
- Month 12 DSCR: 1.68×
- Ledger clients: 25
- Monthly DSCR path: 0.58, 0.67, 0.77, 0.88, 0.99, 1.09, 1.19, 1.28, 1.38, 1.48, 1.58, 1.68
- SBA 1.25× threshold crossed at month 8

Upside:
- Year 2 ARR: $4.1M
- Month 12 DSCR: 2.24×
- Ledger clients: 34
- Monthly DSCR path: 0.62, 0.75, 0.89, 1.03, 1.17, 1.31, 1.46, 1.62, 1.79, 1.95, 2.11, 2.24

EXECUTION ROADMAP:
- Now: Close facility, inject verified equity, onboard retained technical search
- 90 days: Private beta - AIVCS Mesh and Kilokind routing engine live with design partners
- 6 months: Commercial launch - Paid team conversion, enterprise pilots, SOC 2 readiness
- 9 months: Revenue proof - Recurring portfolio revenue supports 1.25×+ DSCR
- 12 months: Seed round - $3.0M SAFE at targeted $25M post-money cap

COMPLIANCE:
SBA 7(a) structure compliant with SOP 50 10 8.1 (Standard Operating Procedure for SBA 7(a) loans).

CREDIT THESIS:
Commercial debt preserves founder ownership while increasing the evidence base for institutional equity. Finance the team, own the category, repay from growth.
`.trim()

const RATE_LIMIT_MAP = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60000
const RATE_LIMIT_MAX = 10

function getRateLimitKey(request: Request): string {
  return request.headers.get("cf-connecting-ip") || "unknown"
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = RATE_LIMIT_MAP.get(key)

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    RATE_LIMIT_MAP.set(key, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const rateLimitKey = getRateLimitKey(context.request)

  if (!checkRateLimit(rateLimitKey)) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait a moment and try again.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  try {
    const { question } = (await context.request.json()) as { question: string }

    if (!question || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (question.length > 500) {
      return new Response(
        JSON.stringify({
          error: "Question is too long. Please keep it under 500 characters.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant that answers questions about Lornuai's commercial credit memorandum. You ONLY provide information that is explicitly stated in the context below. If the answer is not in the context, say "I don't have that information in this memo." Never make up figures or speculate. Always remind users that projections are not guarantees.

Context:
${DECK_CONTEXT}`,
      },
      {
        role: "user",
        content: question,
      },
    ]

    const response = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages,
      max_tokens: 512,
      temperature: 0.3,
    })

    const answer =
      typeof response === "object" && "response" in response
        ? response.response
        : "Unable to generate an answer right now."

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing question:", error)
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your question.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
