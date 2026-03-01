export type ProjectStatus = "live" | "research" | "archive";

export interface Metric {
  readonly value: string;
  readonly label: string;
}

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly status: ProjectStatus;
  readonly description: string;
  readonly metrics: readonly Metric[];
  readonly tags: readonly string[];
  readonly repoUrl?: string;
}

export interface ArticleTopic {
  readonly title: string;
  readonly summary: string;
}

export interface Article {
  readonly id: string;
  readonly slug?: string;
  readonly date?: string;
  readonly title: string;
  readonly hook: string;
  readonly tags: readonly string[];
  readonly accent: "amber" | "toxic" | "rust" | "bone";
  readonly readTime: string;
  readonly topicCount: number;
  readonly topics: readonly ArticleTopic[];
  readonly repoUrl?: string;
}

export interface SystemLayer {
  readonly name: string;
  readonly description: string;
  readonly icon: "monitor" | "bolt" | "bell";
  readonly accent: "amber" | "toxic" | "rust";
}

export interface SideProject {
  readonly name: string;
  readonly stack: string;
  readonly description: string;
  readonly accent: "amber" | "toxic";
  readonly repoUrl?: string;
}

export interface StackCategory {
  readonly label: string;
  readonly accent: "amber" | "toxic" | "rust" | "bone";
  readonly items: readonly string[];
}

export const PROJECTS: readonly Project[] = [
  {
    id: "SYS::ALPHA_AGENT",
    name: "Alpha Agent",
    status: "research",
    description:
      "Post-ASI scenario simulator using Bayesian weighting with market-anchored priors from Metaculus and Polymarket. Morris screening + Sobol sensitivity analysis across 20-parameter space.",
    metrics: [
      { value: "5", label: "Scenarios" },
      { value: "20", label: "Parameters" },
      { value: "688", label: "Predictions" },
    ],
    tags: ["Python", "Bayesian", "Monte Carlo", "Walk-Forward"],
    repoUrl: "https://github.com/kris-welc/asi-simulator",
  },
  {
    id: "SYS::SYBIL",
    name: "Sybil",
    status: "live",
    description:
      "Macro intelligence engine tracking 68 tickers with Hidden Markov Model regime detection. VAR forecasting with Bayesian self-improvement and seasonal decomposition.",
    metrics: [
      { value: "68", label: "Tickers" },
      { value: "HMM", label: "Regime Engine" },
      { value: "VAR", label: "Forecasting" },
    ],
    tags: ["Python", "HMM", "Geopolitical Risk", "LLM Scoring"],
    repoUrl: "https://github.com/kris-welc/sybil",
  },
  {
    id: "SYS::V33_MONEYTREES",
    name: "V33 MoneyTrees",
    status: "live",
    description:
      "Algorithmic perpetual futures trader with adaptive regime detection, Bayesian Thompson Sampling signal weighting, ADWIN drift detection, and Renko-based entries.",
    metrics: [
      { value: "98.3%", label: "MC Confidence" },
      { value: "66%", label: "Win Rate" },
      { value: "2.02", label: "Profit Factor" },
    ],
    tags: ["Python", "Bybit", "Thompson Sampling", "VPIN/CVD"],
    repoUrl: "https://github.com/kris-welc/moneytrees",
  },
  {
    id: "SYS::COPYBOT",
    name: "Copybot",
    status: "live",
    description:
      "Multi-feed prediction market trading system with two-path ensemble voting, NBA Elo modeling, Binance OBI signals, and automated position management with Kelly sizing.",
    metrics: [
      { value: "2-Path", label: "Ensemble" },
      { value: "4", label: "Signal Feeds" },
      { value: "Kelly", label: "Sizing" },
    ],
    tags: ["Python", "Polymarket", "Elo Model", "Ensemble"],
    repoUrl: "https://github.com/kris-welc/copybot",
  },
] as const;

export const ARTICLES: readonly Article[] = [
  {
    id: "agent-algebra",
    slug: "agent-algebra",
    date: "2026-02-28",
    title: "Agent Algebra: Theorem-Guided Composition for Self-Improving AI Systems",
    hook: "LLM orchestration has no formal theory. Chains, tools, and retry loops are plumbing — not algebra. Six mathematical theorems provide convergence guarantees that transform agent composition from craft into engineering.",
    tags: ["Agent Composition", "Mathematical Guarantees", "Open Source"],
    accent: "amber",
    readTime: "14 min",
    topicCount: 6,
    repoUrl: "https://github.com/kris-welc/agent-algebra",
    topics: [
      {
        title: "Contraction Mapping",
        summary: "Banach Fixed-Point iteration — self-calibrating parameter loops with proven convergence in O(log(1/e)) iterations.",
      },
      {
        title: "AdaBoost Cascade",
        summary: "Weak learners combined into arbitrarily strong ensembles. Each agent focuses on the errors of the previous. Error drops exponentially.",
      },
      {
        title: "Proper Scoring Rules",
        summary: "Brier and log scores make honesty the dominant strategy. Calibration-weighted aggregation via logarithmic opinion pools.",
      },
      {
        title: "Ergodicity-Corrected Kelly",
        summary: "Standard Kelly assumes i.i.d. bets. Real trading has serial correlation and regime shifts. Path-dependent correction prevents ruin.",
      },
      {
        title: "Belief Propagation",
        summary: "Pearl's message-passing algorithm on agent graphs. Local communication, globally optimal posteriors.",
      },
      {
        title: "MDL Compression",
        summary: "Kolmogorov complexity via zlib compression ratio. If a pattern compresses, it's signal. If not, it's noise.",
      },
    ],
  },
  {
    id: "dual-layer-regime",
    slug: "dual-layer-regime",
    date: "2026-02-28",
    title: "Dual-Layer Regime Detection: When Statistical Drift Meets Structural Classification",
    hook: "Most trading systems use one regime detector. We use two orthogonal layers — Kaufman ER for structural classification and ADWIN for transition detection — catching regime changes 1-3 bars before traditional methods.",
    tags: ["Algorithmic Trading", "Regime Detection", "ADWIN"],
    accent: "toxic",
    readTime: "10 min",
    topicCount: 4,
    repoUrl: "https://github.com/kris-welc/agent-algebra",
    topics: [
      {
        title: "Kaufman Efficiency Ratio",
        summary: "Net displacement vs total path length. Graduated CHOP split blocks longs in sideways markets while allowing shorts.",
      },
      {
        title: "ADWIN Drift Detection",
        summary: "River's adaptive windowing monitors return and volatility distributions. Detects regime transitions within 1-3 bars.",
      },
      {
        title: "Graduated CHOP",
        summary: "Five-tier regime classification: TREND, NORMAL, VOLATILE, LIGHT_CHOP (longs blocked), DEEP_CHOP (3 confirms required).",
      },
      {
        title: "Composition",
        summary: "Two layers composited: effective_size = regime_mult x adwin_modifier. Uncertainty haircut ramps from 60% to 100% over 3 bars.",
      },
    ],
  },
  {
    id: "vpin-conviction",
    slug: "vpin-conviction",
    date: "2026-02-28",
    title: "VPIN as Real-Time Conviction Modifier: Bridging Microstructure Theory to Execution",
    hook: "Academic VPIN studies were retrospective, computed over days. We run it at 1-hour resolution from a live WebSocket trade stream, using informed flow direction to boost or cut position conviction in real time.",
    tags: ["Microstructure", "VPIN", "Order Flow"],
    accent: "rust",
    readTime: "8 min",
    topicCount: 3,
    repoUrl: "https://github.com/kris-welc/agent-algebra",
    topics: [
      {
        title: "WebSocket Daemon Architecture",
        summary: "Standalone process subscribes to Bybit trade stream, classifies buyer/seller-initiated trades, aggregates into 1-minute VPIN buckets.",
      },
      {
        title: "Directional Conviction Modifier",
        summary: "VPIN > 0.20 with confirming direction boosts conviction +0.15. Opposing smart money cuts -0.20. Asymmetric by design.",
      },
      {
        title: "Decoupled Real-Time Enrichment",
        summary: "Two-database architecture: ws_collector writes SQLite, live trader reads with 2-second timeout. Clean process boundary.",
      },
    ],
  },
  {
    id: "high-value-ai-skills-2027",
    title: "High-Value AI Skills That Will Define 2027",
    hook: "While everyone panics about AI eliminating jobs, a completely different shift is happening. New skills are becoming extremely valuable — skills that didn't matter six months ago. The people learning them now will set their own rates.",
    tags: ["AI Strategy", "Career", "Automation"],
    accent: "amber",
    readTime: "8 min",
    topicCount: 7,
    topics: [
      {
        title: "AI System Architecture",
        summary:
          "Designing systems where AI, automation, and humans work together. A thinking skill, not a technical skill — understanding business operations, data flow, and how pieces connect.",
      },
      {
        title: "Context Engineering",
        summary:
          "Prompt engineering is commoditized. Setting up environments where AI has all the context before you ask is what separates a tool from a team member.",
      },
      {
        title: "AI Training Data Curation",
        summary:
          "Curating, structuring, and maintaining data that makes AI useful for a specific business. Closer to being a librarian for AI than a data scientist.",
      },
      {
        title: "AI-Human Workflow Design",
        summary:
          "Designing handoff workflows where AI does the first pass, human reviews, AI implements changes. Speed and quality, not one or the other.",
      },
      {
        title: "No-Code AI Workflows",
        summary:
          "Building complex AI-powered workflows visually with n8n, Make, and Zapier. Delivering measurable 20+ hour/week savings. Free to learn, most people don't know it's valuable.",
      },
      {
        title: "AI Output Quality Control",
        summary:
          "Evaluating AI output at scale — catching errors, identifying generic versus useful output, building systems for consistent quality. Bad AI output is expensive.",
      },
      {
        title: "Automation Maintenance",
        summary:
          "Building automation is one skill. Keeping it running is another. Auditing, optimizing, and fixing drift in automated systems. The mechanic role that doesn't exist at scale yet.",
      },
    ],
  },
  {
    id: "vibe-coding-2-rules",
    title: "Vibe Coding 2.0 — 18 Rules for Shipping Fast",
    hook: "Most people waste months building things that should take weeks. Not because they're bad developers — because they made decisions that felt right but buried them in technical debt before they shipped. The best builders know what NOT to build.",
    tags: ["Development", "Shipping", "Tools"],
    accent: "toxic",
    readTime: "12 min",
    topicCount: 18,
    topics: [
      {
        title: "Use Ready-Made Auth",
        summary:
          "Clerk or Supabase Auth. Sessions, tokens, OAuth, security edge cases — handled. Stop spending 2 weeks on auth for an MVP nobody has validated yet.",
      },
      {
        title: "Tailwind + shadcn/ui for UI",
        summary:
          "Figma to working UI in 2-3 hours. Consistent sizing, no random colors, no eyeballing pixels at 1am. The highest ROI decision you'll make.",
      },
      {
        title: "Zustand + Server Components",
        summary:
          "No Redux. No 6-layer Context wrappers. No PhD in state architecture for a product with 12 users. Zustand for client state, Server Components for the rest.",
      },
      {
        title: "tRPC + Server Actions for APIs",
        summary:
          "End-to-end type safety without configuration overhead. Eliminates an entire layer of boilerplate that used to eat up days.",
      },
      {
        title: "Deploy with Vercel One-Click",
        summary:
          "One push to main, done. Your energy is worth more than your server config. Manual deployments are a productivity trap.",
      },
      {
        title: "Prisma + Managed Postgres",
        summary:
          "Typed ORM, easy migrations, easy reads. Supabase/Neon/Railway for managed hosting. Handles 95% of what any MVP needs without friction.",
      },
      {
        title: "Validate with Zod + RHF",
        summary:
          "Zod for schema validation, React Hook Form for state. Unvalidated inputs is how you get broken data and angry users at 2am.",
      },
      {
        title: "Stripe for Payments",
        summary:
          "Never build your own payment system. Payments, subscriptions, refunds, compliance — 45 minutes to integrate and it works.",
      },
      {
        title: "Error Tracking on Day 1",
        summary:
          "Sentry tells you what broke, where, and how often. Set it up before launch, not after a user tweets at you about a crash.",
      },
      {
        title: "Analytics From the Start",
        summary:
          "PostHog or Plausible. If you don't know how users move through your product, you're guessing. Guessing for 3 months is how you build the wrong thing.",
      },
      {
        title: "Secrets in Env Files",
        summary:
          "Hardcoding API keys is obvious in hindsight, catastrophic in the moment. Use .env, add to .gitignore, use Doppler or Vercel for production.",
      },
      {
        title: "UploadThing for Files",
        summary:
          "File uploads seem simple until you're managing storage, CDN, size limits, and security. Integrate in an afternoon, move on.",
      },
      {
        title: "Preview Deployments",
        summary:
          "Every PR gets a preview URL. Test changes before production. Saves you from emergency rollbacks at midnight.",
      },
      {
        title: "Radix + shadcn Components",
        summary:
          "Unstyled, accessible, production-grade primitives. Build almost any UI pattern without reinventing the wheel.",
      },
      {
        title: "README From Day 1",
        summary:
          "You won't remember how everything works in 3 weeks. 20 minutes to write, saves 4 hours of confusion. Makes client handoffs smooth.",
      },
      {
        title: "Clean Folder Structure",
        summary:
          "Messy structure compounds. Every feature added to a messy codebase costs 30% more time just navigating. Components, hooks, utils, types — keep it predictable.",
      },
      {
        title: "Onboarding + Empty States",
        summary:
          "Most underrated UX investment. Empty states tell users what to do. Onboarding shows how to get value on day one. Confused users don't convert — they leave.",
      },
      {
        title: "Lighthouse Before Launch",
        summary:
          "Slow apps lose users. Free performance audit in 30 seconds. Score below 70 is a red flag. Fix before launch, not after you've lost users.",
      },
    ],
  },
] as const;

export const SYSTEM_LAYERS: readonly SystemLayer[] = [
  {
    name: "Intelligence Layer",
    description:
      "Sybil + Alpha Agent provide macro signals, scenario analysis, and regime detection across 68 instruments",
    icon: "monitor",
    accent: "amber",
  },
  {
    name: "Execution Layer",
    description:
      "V33 and Copybot execute trades autonomously across crypto perps and prediction markets, 24/7",
    icon: "bolt",
    accent: "toxic",
  },
  {
    name: "Intel Layer",
    description:
      "Multi-channel AI-curated news digests with Gemini scoring, RSS feeds, and custom delivery schedules",
    icon: "bell",
    accent: "rust",
  },
] as const;

export const SIDE_PROJECTS: readonly SideProject[] = [
  {
    name: "Aeryn",
    stack: "SwiftUI + Firebase",
    description:
      "iOS ally/achiever system with smart notification scheduling, habit tracking, and adaptive behavior via Cloud Functions.",
    accent: "amber",
    repoUrl: "https://github.com/kris-welc/ww1",
  },
  {
    name: "Intel Digest",
    stack: "Python + Gemini",
    description:
      "AI-powered news curation across 4 channels — tech, wellness, jobs, and personal. LLM-scored with customizable delivery.",
    accent: "toxic",
    repoUrl: "https://github.com/kris-welc/intel-digest",
  },
] as const;

export const STACK: readonly StackCategory[] = [
  {
    label: "CORE",
    accent: "amber",
    items: ["Python", "Swift / SwiftUI", "TypeScript"],
  },
  {
    label: "AI / ML",
    accent: "toxic",
    items: ["Claude / Gemini", "HMM / VAR", "Bayesian Methods"],
  },
  {
    label: "INFRA",
    accent: "rust",
    items: ["GCP Compute", "Firebase", "Secret Manager"],
  },
  {
    label: "DATA",
    accent: "bone",
    items: ["SQLite / Firestore", "WebSocket Feeds", "FRED / yfinance"],
  },
] as const;

export const SOCIAL_LINKS = [
  { name: "GITHUB", href: "https://github.com/kris-welc", type: "github" },
  {
    name: "LINKEDIN",
    href: "https://linkedin.com/in/kris-welc",
    type: "linkedin",
  },
] as const;
