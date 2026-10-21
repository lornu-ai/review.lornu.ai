import { useEffect, useMemo, useState, useRef } from "react"

type ScenarioKey = "conservative" | "base" | "upside"

const scenarios: Record<
  ScenarioKey,
  {
    label: string
    arr: string
    dscr: string
    clients: string
    series: number[]
  }
> = {
  conservative: {
    label: "Conservative",
    arr: "$1.8M",
    dscr: "1.31×",
    clients: "18",
    series: [
      0.52, 0.61, 0.69, 0.78, 0.87, 0.96, 1.06, 1.15, 1.23, 1.27, 1.29, 1.31,
    ],
  },
  base: {
    label: "Base case",
    arr: "$2.7M",
    dscr: "1.68×",
    clients: "25",
    series: [
      0.58, 0.67, 0.77, 0.88, 0.99, 1.09, 1.19, 1.28, 1.38, 1.48, 1.58, 1.68,
    ],
  },
  upside: {
    label: "Upside",
    arr: "$4.1M",
    dscr: "2.24×",
    clients: "34",
    series: [
      0.62, 0.75, 0.89, 1.03, 1.17, 1.31, 1.46, 1.62, 1.79, 1.95, 2.11, 2.24,
    ],
  },
}

const nav = [
  "Thesis",
  "Market",
  "Engine",
  "Portfolio",
  "Economics",
  "Capital",
  "Coverage",
  "Roadmap",
  "Close",
]

const products = [
  {
    name: "AIVCS",
    tag: "Sovereign AI version control",
    metric: "$180K+",
    unit: "enterprise ACV",
    description:
      "A content-addressable substrate for hundreds of autonomous coding agents.",
  },
  {
    name: "Kilokind",
    tag: "AI infrastructure optimization",
    metric: "72%",
    unit: "lower task cost",
    description:
      "Routes each task to the most efficient model while preserving quality.",
  },
  {
    name: "Lone Star Ledgers",
    tag: "Autonomous financial ops",
    metric: "$575",
    unit: "blended monthly ARPU",
    description:
      "Domestic, AI-powered bookkeeping for Central Texas operators.",
  },
  {
    name: "Sovereign Exec",
    tag: "Executive talent orchestration",
    metric: "5%",
    unit: "success fee",
    description:
      "High-touch, AI-native representation for senior technology leaders.",
  },
]

interface ChatMessage {
  role: "user" | "assistant" | "error"
  content: string
}

function Mark() {
  return (
    <div className="brand" aria-label="Lornu.ai">
      <span className="brand-mark">
        <span />
      </span>
      <span className="brand-name">lornu.ai</span>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  )
}

function SlideFrame({
  index,
  eyebrow,
  title,
  intro,
  children,
  dark = false,
}: {
  index: number
  eyebrow: string
  title: React.ReactNode
  intro?: string
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <section className={`slide ${dark ? "slide-dark" : "slide-light"}`}>
      <div className="slide-head">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2>{title}</h2>
        </div>
        <div className="chapter">0{index + 1} / 09</div>
      </div>
      {intro && <p className="slide-intro">{intro}</p>}
      <div className="slide-body">{children}</div>
    </section>
  )
}

function ChatPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = (await response.json()) as { answer: string }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content:
            "Unable to answer right now. The AI service may be temporarily unavailable.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className={`chat-panel ${isOpen ? "open" : ""}`}>
      <div className="chat-header">
        <h3 className="chat-title">Ask the memo</h3>
        <button
          className="chat-close"
          onClick={onClose}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-message assistant">
            <div className="chat-bubble">
              Ask me anything about Lornuai's $1.25M SBA 7(a) facility request,
              our portfolio companies, DSCR projections, or use of funds. I only
              answer from this memo.
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="chat-bubble">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-disclaimer">
        Answers are grounded in this deck. Figures are projections, not
        guarantees. This is not financial advice.
      </div>
      <div className="chat-input-wrap">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder="What's the facility amount?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="chat-send" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </aside>
  )
}

function App() {
  const [active, setActive] = useState(0)
  const [scenario, setScenario] = useState<ScenarioKey>("base")
  const [overview, setOverview] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const scenarioData = scenarios[scenario]

  const path = useMemo(() => {
    return scenarioData.series
      .map((value, i) => {
        const x = 10 + (i / 11) * 580
        const y = 180 - ((value - 0.4) / 1.9) * 150
        return `${x},${Math.max(15, y)}`
      })
      .join(" ")
  }, [scenarioData])

  const go = (direction: number) =>
    setActive((current) =>
      Math.max(0, Math.min(nav.length - 1, current + direction)),
    )

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault()
        setActive((current) => Math.min(nav.length - 1, current + 1))
      }
      if (event.key === "ArrowLeft")
        setActive((current) => Math.max(0, current - 1))
      if (event.key === "Escape") {
        setOverview(false)
        setChatOpen(false)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const slides = [
    <section className="slide hero-slide" key="hero">
      <div className="hero-grid" />
      <div className="hero-content">
        <Eyebrow>Commercial working capital memorandum · October 2026</Eyebrow>
        <h1>
          Capital to build the
          <br />
          infrastructure that makes
          <br />
          <em>autonomous AI work.</em>
        </h1>
        <p className="hero-copy">
          A disciplined $1.25M SBA 7(a) facility to convert a validated AI
          portfolio into durable, enterprise-grade recurring revenue.
        </p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={() => setActive(1)}>
            Review the case <span>→</span>
          </button>
          <button className="text-btn" onClick={() => setActive(5)}>
            Jump to use of funds
          </button>
        </div>
      </div>
      <div className="hero-ask">
        <span className="ask-label">Facility request</span>
        <strong>$1.25M</strong>
        <div className="ask-rule" />
        <div className="ask-row">
          <span>Structure</span>
          <b>SBA 7(a)</b>
        </div>
        <div className="ask-row">
          <span>Purpose</span>
          <b>Talent + GTM</b>
        </div>
        <div className="ask-row">
          <span>Seed round</span>
          <b>$3.0M</b>
        </div>
      </div>
      <div className="hero-foot">
        <span>Prepared for J.P. Morgan Innovation Economy</span>
        <span>Pflugerville, Texas · Delaware C-Corp</span>
      </div>
    </section>,

    <SlideFrame
      key="market"
      index={1}
      eyebrow="The market transition"
      title={
        <>
          Legacy infrastructure was built for
          <br />
          <em>human-speed software.</em>
        </>
      }
      intro="Autonomous agents now create, test, and deploy at machine speed. The control plane beneath them has not caught up."
    >
      <div className="market-layout">
        <div className="market-number">
          <span>Serviceable market</span>
          <strong>$12.2B</strong>
          <p>AI-native engineering substrates and AgentOps</p>
        </div>
        <div className="comparison">
          <div className="compare-row">
            <span>Parallel agent capacity</span>
            <div className="track">
              <i style={{ width: "18%" }} />
            </div>
            <b>10–20</b>
          </div>
          <div className="compare-row compare-gold">
            <span>Lornu architecture</span>
            <div className="track">
              <i style={{ width: "88%" }} />
            </div>
            <b>500+</b>
          </div>
          <div className="compare-row">
            <span>Legacy verification</span>
            <div className="track">
              <i style={{ width: "74%" }} />
            </div>
            <b>10–30m</b>
          </div>
          <div className="compare-row compare-gold">
            <span>Fast Free Testing</span>
            <div className="track">
              <i style={{ width: "5%" }} />
            </div>
            <b>&lt;1 sec</b>
          </div>
        </div>
      </div>
      <div className="thesis-strip">
        <span>Structural shift</span>
        <p>
          The next infrastructure category is not another code host. It is a
          sovereign execution layer for autonomous work.
        </p>
      </div>
    </SlideFrame>,

    <SlideFrame
      key="engine"
      index={2}
      eyebrow="The operating model"
      title={
        <>
          A startup engine,
          <br />
          <em>not a passive fund.</em>
        </>
      }
      intro="We identify infrastructure gaps, recruit domain founders, and embed our operators until architecture and commercial motion are proven."
      dark
    >
      <div className="engine-flow">
        {[
          [
            "01",
            "Discover",
            "Find the missing layer beneath fast-growing AI workflows.",
          ],
          [
            "02",
            "Co-found",
            "Pair technical founders with shared capital and operating leverage.",
          ],
          [
            "03",
            "Co-build",
            "Deploy product, engineering, cloud, and go-to-market talent.",
          ],
          [
            "04",
            "Scale",
            "Graduate a revenue-ready company with an institutional narrative.",
          ],
        ].map(([n, label, copy], i) => (
          <div className="engine-step" key={label}>
            <span>{n}</span>
            <i />
            <h3>{label}</h3>
            <p>{copy}</p>
            {i < 3 && <b>→</b>}
          </div>
        ))}
      </div>
      <div className="engine-stats">
        <div>
          <strong>6</strong>
          <span>portfolio companies</span>
        </div>
        <div>
          <strong>3</strong>
          <span>active co-builds</span>
        </div>
        <div>
          <strong>18mo</strong>
          <span>seed-to-A timeline</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>AI-native portfolio</span>
        </div>
      </div>
    </SlideFrame>,

    <SlideFrame
      key="portfolio"
      index={3}
      eyebrow="Diversified revenue architecture"
      title={
        <>
          One operating core.
          <br />
          <em>Four commercial surfaces.</em>
        </>
      }
      intro="Shared engineering, cloud infrastructure, and enterprise relationships compound across a deliberately connected portfolio."
    >
      <div className="portfolio-grid">
        {products.map((product, i) => (
          <article className="product" key={product.name}>
            <div className="product-top">
              <span>0{i + 1}</span>
              <i />
            </div>
            <small>{product.tag}</small>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="product-metric">
              <strong>{product.metric}</strong>
              <span>{product.unit}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="portfolio-foot">
        <span>Co-built ecosystem</span>
        <p>
          Inference Labs · Cartographer · Grounded · Synthex · Recall · Prism
        </p>
      </div>
    </SlideFrame>,

    <SlideFrame
      key="economics"
      index={4}
      eyebrow="The revenue system"
      title={
        <>
          Open-core adoption.
          <br />
          <em>Enterprise-grade monetization.</em>
        </>
      }
      intro="Free developer entry creates distribution. Commercial controls, sovereign deployment, and managed operations create high-margin revenue."
      dark
    >
      <div className="funnel">
        <div className="funnel-stage stage-one">
          <span>01 · Adopt</span>
          <strong>Community</strong>
          <p>CLI, local CAS, five private repos</p>
          <b>Free</b>
        </div>
        <div className="funnel-stage stage-two">
          <span>02 · Expand</span>
          <strong>Teams</strong>
          <p>Orchestration, unlimited repos, FFT</p>
          <b>$29–39 / seat</b>
        </div>
        <div className="funnel-stage stage-three">
          <span>03 · Govern</span>
          <strong>Enterprise</strong>
          <p>Air-gapped mesh, custom builders, SLA</p>
          <b>$180K+ / cluster</b>
        </div>
      </div>
      <div className="economics-grid">
        <div>
          <span>Projected gross margin</span>
          <strong>84.2%</strong>
        </div>
        <div>
          <span>Ledger clients at operating break-even</span>
          <strong>25</strong>
        </div>
        <div>
          <span>Enterprise contract motion</span>
          <strong>Direct</strong>
        </div>
      </div>
    </SlideFrame>,

    <SlideFrame
      key="capital"
      index={5}
      eyebrow="Use of funds"
      title={
        <>
          Every dollar creates
          <br />
          <em>revenue capacity.</em>
        </>
      }
      intro="The facility is narrowly allocated to the people and systems required to reach beta in three months and full go-to-market in six to nine."
    >
      <div className="capital-layout">
        <div className="allocation-total">
          <span>Total facility</span>
          <strong>$1.25M</strong>
          <p>12-month deployment</p>
          <div className="stacked-bar">
            <i style={{ width: "68%" }} />
            <i style={{ width: "9.6%" }} />
            <i style={{ width: "8.4%" }} />
            <i style={{ width: "6.8%" }} />
            <i style={{ width: "6%" }} />
          </div>
        </div>
        <div className="allocation-list">
          {[
            ["$850K", "Elite engineering payroll", "68%"],
            ["$120K", "Recruitment + incentives", "9.6%"],
            ["$105K", "Cloud + AI compute", "8.4%"],
            ["$85K", "Developer acquisition", "6.8%"],
            ["$75K", "Contingency reserve", "6.0%"],
            ["$15K", "Compliance + finance", "1.2%"],
          ].map(([amount, label, percent]) => (
            <div className="allocation-row" key={label}>
              <strong>{amount}</strong>
              <span>{label}</span>
              <b>{percent}</b>
            </div>
          ))}
        </div>
      </div>
      <div className="hire-strip">
        <span>4 foundational hires</span>
        <p>Lead Rust · Distributed Systems · AI/ML Evals · DevSecOps</p>
      </div>
    </SlideFrame>,

    <SlideFrame
      key="coverage"
      index={6}
      eyebrow="Interactive underwriting lens"
      title={
        <>
          A visible path to
          <br />
          <em>institutional coverage.</em>
        </>
      }
      intro="Toggle the operating case to stress-test the projected repayment profile. The 1.25× SBA threshold is crossed in the base case by month eight."
      dark
    >
      <div className="scenario-tabs" role="tablist">
        {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
          <button
            key={key}
            className={scenario === key ? "active" : ""}
            onClick={() => setScenario(key)}
          >
            {scenarios[key].label}
          </button>
        ))}
      </div>
      <div className="coverage-layout">
        <div className="chart-wrap">
          <div className="chart-label">
            <span>Projected DSCR</span>
            <b>1.25× minimum</b>
          </div>
          <svg
            className="chart"
            viewBox="0 0 600 200"
            role="img"
            aria-label={`${scenarioData.label} debt service coverage projection`}
          >
            <line x1="10" y1="113" x2="590" y2="113" className="threshold" />
            <polyline points={path} className="chart-line" />
            {scenarioData.series.map((value, i) => {
              const x = 10 + (i / 11) * 580
              const y = Math.max(15, 180 - ((value - 0.4) / 1.9) * 150)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={i === 11 ? 5 : 2.5}
                  className="chart-dot"
                />
              )
            })}
          </svg>
          <div className="chart-months">
            <span>M1</span>
            <span>M4</span>
            <span>M8</span>
            <span>M12</span>
          </div>
        </div>
        <div className="coverage-metrics">
          <div>
            <span>Year 2 ARR</span>
            <strong>{scenarioData.arr}</strong>
          </div>
          <div>
            <span>Month 12 DSCR</span>
            <strong>{scenarioData.dscr}</strong>
          </div>
          <div>
            <span>Ledger clients</span>
            <strong>{scenarioData.clients}</strong>
          </div>
          <p>
            84.2% projected gross margin and diversified recurring revenue
            provide the repayment cushion.
          </p>
        </div>
      </div>
    </SlideFrame>,

    <SlideFrame
      key="roadmap"
      index={7}
      eyebrow="Execution roadmap"
      title={
        <>
          Debt funds the build.
          <br />
          <em>Revenue funds the scale.</em>
        </>
      }
      intro="The facility bridges a defined set of product, compliance, and commercial milestones ahead of a planned $3.0M institutional seed."
    >
      <div className="timeline">
        {[
          [
            "Now",
            "Close facility",
            "Inject verified equity and onboard retained technical search.",
          ],
          [
            "90 days",
            "Private beta",
            "AIVCS Mesh and Kilokind routing engine live with design partners.",
          ],
          [
            "6 months",
            "Commercial launch",
            "Paid team conversion, enterprise pilots, SOC 2 readiness.",
          ],
          [
            "9 months",
            "Revenue proof",
            "Recurring portfolio revenue supports 1.25×+ DSCR.",
          ],
          [
            "12 months",
            "Seed round",
            "$3.0M SAFE at targeted $25M post-money cap.",
          ],
        ].map(([time, title, copy], i) => (
          <div className="timeline-item" key={time}>
            <div className="timeline-marker">
              <span>{i + 1}</span>
            </div>
            <small>{time}</small>
            <h3>{title}</h3>
            <p>{copy}</p>
          </div>
        ))}
      </div>
      <div className="roadmap-note">
        <span>Non-dilutive leverage</span>
        <p>
          Commercial debt preserves founder ownership while increasing the
          evidence base for institutional equity.
        </p>
      </div>
    </SlideFrame>,

    <section className="slide close-slide" key="close">
      <div className="close-grid" />
      <div className="close-content">
        <Eyebrow>The credit thesis</Eyebrow>
        <h2>
          Finance the team.
          <br />
          Own the category.
          <br />
          <em>Repay from growth.</em>
        </h2>
        <p>
          Lornuai is requesting a $1.25M SBA 7(a) working capital facility to
          turn proprietary AI infrastructure, proven operating leverage, and a
          diversified commercial portfolio into durable enterprise revenue.
        </p>
      </div>
      <div className="close-proof">
        <div>
          <strong>$1.25M</strong>
          <span>facility request</span>
        </div>
        <div>
          <strong>84.2%</strong>
          <span>projected gross margin</span>
        </div>
        <div>
          <strong>1.68×</strong>
          <span>base-case month 12 DSCR</span>
        </div>
        <button onClick={() => setActive(0)}>
          Restart presentation <span>↗</span>
        </button>
      </div>
      <div className="close-footer">
        <Mark />
        <span>review.lornu.ai · Confidential</span>
      </div>
    </section>,
  ]

  return (
    <main className="app-shell">
      <header className="topbar">
        <Mark />
        <div className="topbar-center">
          Commercial credit review <span>·</span> Confidential
        </div>
        <button className="overview-btn" onClick={() => setOverview(true)}>
          <span className="grid-icon">⊞</span> Overview
        </button>
      </header>
      <aside className="side-nav" aria-label="Presentation chapters">
        {nav.map((item, i) => (
          <button
            key={item}
            onClick={() => setActive(i)}
            className={i === active ? "active" : ""}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            <b>{item}</b>
          </button>
        ))}
      </aside>
      <div className={`deck ${chatOpen ? "chat-open" : ""}`}>
        {slides[active]}
      </div>
      <footer className={`controls ${chatOpen ? "chat-open" : ""}`}>
        <div className="progress">
          <i style={{ width: `${((active + 1) / nav.length) * 100}%` }} />
        </div>
        <div className="counter">
          <span>{String(active + 1).padStart(2, "0")}</span> / 09
        </div>
        <div className="arrows">
          <button
            onClick={() => go(-1)}
            disabled={active === 0}
            aria-label="Previous slide"
          >
            ←
          </button>
          <button
            onClick={() => go(1)}
            disabled={active === nav.length - 1}
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      </footer>
      {overview && (
        <div
          className="overview-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Presentation overview"
        >
          <div className="overview-head">
            <div>
              <Eyebrow>Presentation map</Eyebrow>
              <h2>Credit committee review</h2>
            </div>
            <button onClick={() => setOverview(false)}>Close</button>
          </div>
          <div className="overview-grid">
            {nav.map((item, i) => (
              <button
                key={item}
                className={i === active ? "active" : ""}
                onClick={() => {
                  setActive(i)
                  setOverview(false)
                }}
              >
                <span>0{i + 1}</span>
                <strong>{item}</strong>
                <p>
                  {
                    [
                      "The ask and investment thesis",
                      "Market timing and structural gap",
                      "Embedded venture-building model",
                      "Commercial product surfaces",
                      "Open-core revenue engine",
                      "12-month capital allocation",
                      "Scenario-based DSCR proof",
                      "Milestones to institutional seed",
                      "Credit thesis and next step",
                    ][i]
                  }
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <button
        className={`chat-toggle ${chatOpen ? "hidden" : ""}`}
        onClick={() => setChatOpen(true)}
      >
        Ask the memo
      </button>
    </main>
  )
}

export default App
