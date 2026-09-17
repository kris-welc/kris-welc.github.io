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
  /** Wide banner shown at the top of the article. */
  readonly image?: string;
  /** Square crop shown beside the title on the dispatch list. */
  readonly imageThumb?: string;
  readonly imageAlt?: string;
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
      "Post-ASI scenario simulator using Bayesian weighting with priors anchored to public forecasting platforms. Morris screening + Sobol sensitivity analysis across 20-parameter space.",
    metrics: [
      { value: "5", label: "Scenarios" },
      { value: "20", label: "Parameters" },
      { value: "688", label: "Predictions" },
    ],
    tags: ["Python", "Bayesian", "Monte Carlo", "Walk-Forward"],
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
  },
  {
    id: "SYS::V33_MONEYTREES",
    name: "V33 MoneyTrees",
    status: "live",
    description:
      "Autonomous decision engine with adaptive regime detection, Bayesian Thompson Sampling signal weighting, ADWIN drift detection, and event-based triggers.",
    metrics: [
      { value: "98.3%", label: "MC Confidence" },
      { value: "ADWIN", label: "Drift Detection" },
      { value: "24/7", label: "Unattended" },
    ],
    tags: ["Python", "Regime Detection", "Thompson Sampling", "Drift"],
  },
  {
    id: "SYS::COPYBOT",
    name: "Copybot",
    status: "live",
    description:
      "Multi-feed forecasting system with two-path ensemble voting, Elo-style rating models, order-book imbalance features, and automated exposure management.",
    metrics: [
      { value: "2-Path", label: "Ensemble" },
      { value: "4", label: "Signal Feeds" },
      { value: "Auto", label: "Exposure" },
    ],
    tags: ["Python", "Ensemble", "Rating Models", "Forecasting"],
  },
] as const;

export const ARTICLES: readonly Article[] = [
  {
    id: "memory-three-jobs",
    slug: "memory-three-jobs",
    date: "2026-09-17",
    title: "Agent Memory Is Three Jobs, Not One Database",
    hook: "Agents do not need more memory. They need memory that cannot confuse what was said, what happened, and what turned out true. One mixed store makes wrong guesses look like knowledge. Three contracts fix that.",
    tags: ["Agent Memory", "System Design", "Calibration"],
    accent: "amber",
    readTime: "5 min",
    topicCount: 4,
    topics: [
      {
        title: "The Expensive Mix-Up",
        summary:
          "Chat history plus embeddings treats a guess and a verified outcome the same. You paid for a world model and got a scrapbook.",
      },
      {
        title: "Timeline, Lessons, Scoreboard",
        summary:
          "Events answer what moved. Lessons reuse edges and failures. The scoreboard only promotes after reality checks the claim.",
      },
      {
        title: "Mem0 as Lessons",
        summary:
          "Mem0 (mem0.ai) stores short reusable facts across sessions. Use it for edges, failures, and risk limits after verification - not as a dump of every chat turn.",
      },
      {
        title: "The Gate Is the Product",
        summary:
          "Unverified text never becomes weight. Authority follows who was right, not who sounded sure.",
      },
    ],
  },
  {
    id: "astra-field-test",
    slug: "astra-field-test",
    date: "2026-09-06",
    title: "Astra Earned the Reviewer\u2019s Job",
    image: "/images/astra-field-test.jpg",
    imageThumb: "/images/astra-field-test-thumb.jpg",
    imageAlt:
      "A spiral of blue and amber stars with the words UNDER TESTS glowing at its centre",
    hook: "I gave GPT-6 Astra the same work GPT-5.6 Terra already does for me: one bug fix, 300 review calls, and 24 days of a full research loop. Tests were frozen before either model started. Astra judged better on every measure I could check, never threw away a good idea, and gave the same verdict every time. It did not move my outcomes. That is why I trust the judgment result.",
    tags: ["Model Evaluation", "Agent Judgment", "Measured Results"],
    accent: "toxic",
    readTime: "9 min",
    topicCount: 5,
    topics: [
      {
        title: "Passing Tests Measures Your Tests",
        summary:
          "Both models went 100% on a frozen 16-test suite. Reading the patches later found two failures Terra introduced (a hard-coded timestamp unit and a crash on empty input) that the suite never asked about.",
      },
      {
        title: "300 Matched Judgment Calls",
        summary:
          "Astra over Terra: +2.9 pp decision accuracy, +6.1 pp balanced accuracy, 0% wrongly blocked good ideas versus Terra\u2019s 16.7%, and identical verdicts across all three Astra repeats.",
      },
      {
        title: "Why the 'Safer' Model Looked Safer",
        summary:
          "Every false acceptance came from one fixture family: a blank falsification field. Terra audited the form. Astra audited the claim. Only one of those is a risk instinct.",
      },
      {
        title: "The Loop Test Nobody Runs",
        summary:
          "24 branch-days of propose \u2192 review \u2192 real evaluation \u2192 feed forward, Astra in both roles against my usual Luna proposer and Terra reviewer. Same candidates, same zero promotions, but Astra needed 25% fewer calls and half the output tokens to get there.",
      },
      {
        title: "Split Judgment From Enforcement",
        summary:
          "Prefer Astra for claim judgment. Keep required fields, budgets, and promotion thresholds in deterministic code. Three lines of enforcement erase Astra\u2019s entire false-acceptance category.",
      },
    ],
  },
  {
    id: "production-agents",
    slug: "production-agents",
    date: "2026-03-10",
    title: "4 AI Agents That Actually Run in Production (and How to Deploy Each One)",
    hook: "Most agent demos break the moment you need them to run unsupervised. Production agents are different. They trigger on webhooks or cron, handle failures without you, and cost cents per run. Four real architectures: two with no orchestrator, two with a simple router loop. Each one solves a problem people actually deal with.",
    tags: ["AI Agents", "Production Systems", "Deployment"],
    accent: "toxic",
    readTime: "12 min",
    topicCount: 4,
    topics: [
      {
        title: "Research Brief Agent (No Orchestrator)",
        summary: "Webhook triggers web search + structured draft generation. One Cloud Function, 80 lines of Python, $0.05 per brief. Replaces 6-10 hours/week of mechanical reading and writing.",
      },
      {
        title: "Daily Ops Briefing (No Orchestrator)",
        summary: "Cron job pulls from 5 tools at 7 AM. The LLM writes a 2-minute briefing of what needs attention. 30 seconds to run, $0.02 per day. Replaces 30 min of dashboard-checking.",
      },
      {
        title: "Request Triage Pipeline (With Orchestrator)",
        summary: "Three agents in sequence: research, score against criteria, route. The orchestrator is 30 lines of routing logic, not a framework. $0.05 per request, saves 15+ hours/week.",
      },
      {
        title: "Codebase Migration (With Orchestrator)",
        summary: "Scan, migrate in parallel, validate, retry failures with error context, create PR. Handles 400 files for $5. The orchestrator manages fan-out, fan-in, and retry loops.",
      },
    ],
  },
  {
    id: "control-hierarchy",
    slug: "control-hierarchy",
    date: "2026-03-05",
    title: "Stop Using AI. Start Building Around It.",
    hook: "Typing better prompts is not a skill with a future. Wrap the model in systems you control: memory, tools, checks, and loops. Ten principles, a clear ladder of leverage, and what to own this week.",
    tags: ["AI Engineering", "System Design", "Leverage"],
    accent: "amber",
    readTime: "10 min",
    topicCount: 6,
    topics: [
      {
        title: "Models Are Components",
        summary: "AI generates options. Your code verifies, filters, and selects. Never let the model be the authority.",
      },
      {
        title: "Systems Beat Prompts",
        summary: "A structured pipeline (plan \u2192 execute \u2192 verify \u2192 repeat) beats any single prompt, no matter how clever.",
      },
      {
        title: "Build External Memory",
        summary: "Without persistent state, your AI resets every session. Four memory layers turn a chatbot into a system that learns.",
      },
      {
        title: "Tools Over Reasoning",
        summary: "Models get worse when forced to fake computation. Let them call tools instead of replacing them.",
      },
      {
        title: "Where You Sit Matters",
        summary: "Real advantage starts at workflow design (level 3). Below that is consumption with nicer packaging.",
      },
      {
        title: "What to Own",
        summary: "Own your data, your automated processes, and your agent infrastructure. Everything else is rented.",
      },
    ],
  },
  {
    id: "agent-algebra",
    slug: "agent-algebra",
    date: "2026-02-28",
    title: "Six Ways to Know Your Multi-Agent System Actually Improves",
    hook: "You built a retry loop, a voting ensemble, a confidence router. How do you know it settles instead of bouncing around? Six small Python primitives, each with a plain-English guarantee.",
    tags: ["Agent Composition", "Convergence Guarantees", "Open Source"],
    accent: "amber",
    readTime: "12 min",
    topicCount: 6,
    repoUrl: "https://github.com/kris-welc/agent-algebra",
    topics: [
      {
        title: "Will My Loop Settle?",
        summary: "Each update moves partway toward measured reality. The loop stops when movement is tiny, not after a fixed N retries.",
      },
      {
        title: "My Agents Are Mediocre Individually",
        summary: "Averaging keeps them mediocre. Make each later agent focus on earlier misses so combined error drops fast.",
      },
      {
        title: "Which Agent Should I Trust?",
        summary: "Accuracy is the wrong metric. Calibration is what matters. Reward honest probabilities. The best-calibrated agent gets the most weight.",
      },
      {
        title: "How Much Should I Commit?",
        summary: "Size budgets for surviving a bad streak, not the average universe. Failures cluster. Textbook math assumes they don't.",
      },
      {
        title: "My Sources Disagree",
        summary: "Flat averages ignore relationships. Let neighboring sources share beliefs until the network agrees.",
      },
      {
        title: "Is This Signal or Noise?",
        summary: "If a pattern compresses, it's structure. If it doesn't, it's noise. Filter without domain-specific rules.",
      },
    ],
  },
  {
    id: "dual-layer-regime",
    slug: "dual-layer-regime",
    date: "2026-02-28",
    title: "How to Detect When Your System's Rules Stop Working",
    hook: "One sensor says what mode you're in. Another says you're leaving it. Multiply them so you get cautious during transitions, before the old rules hurt you.",
    tags: ["Adaptive Systems", "Drift Detection", "Mode Classification"],
    accent: "toxic",
    readTime: "8 min",
    topicCount: 4,
    topics: [
      {
        title: "Useful vs Wasted Movement",
        summary: "How much of the total movement was productive? Five modes from CLEAR to CHAOS let you respond in steps.",
      },
      {
        title: "Transition Detection",
        summary: "Notice when recent data stops matching older data. Catch the shift before your mode classifier renames it.",
      },
      {
        title: "Graduated Response",
        summary: "Defensive signals still work in noise. Optimistic ones don't. Block hope-driven actions when the stream is chaotic.",
      },
      {
        title: "Multiply the Two Layers",
        summary: "Mode confidence \u00d7 transition caution. Most conservative during noisy transitions. No manual rules needed.",
      },
    ],
  },
  {
    id: "vpin-conviction",
    slug: "vpin-conviction",
    date: "2026-02-28",
    title: "When Experts Disagree With You, Cut Confidence Harder",
    hook: "Watch what the best-informed people do. If they oppose you, trust yourself less - more than you trust yourself more when they agree. Hiring, product, and content all work the same way.",
    tags: ["Decision Systems", "Informed Flow", "Real-Time Enrichment"],
    accent: "rust",
    readTime: "6 min",
    topicCount: 3,
    topics: [
      {
        title: "Measuring Informed Activity",
        summary: "Imbalance between opposing flows shows when knowledgeable people are acting and which way they lean.",
      },
      {
        title: "Asymmetric Confidence Adjustment",
        summary: "Small boost when experts agree. Larger cut when they disagree. Missing a chance costs less than overcommitting.",
      },
      {
        title: "Decoupled Real-Time Architecture",
        summary: "Collector writes. Decision maker reads with a timeout. Enrichment is always additive, never blocking.",
      },
    ],
  },
  {
    id: "high-value-ai-skills-2027",
    title: "7 Skills That Pay More Because of AI (Not Despite It)",
    hook: "Everyone's asking which jobs AI will replace. The better question: which skills become more valuable because AI exists? These seven didn't matter two years ago. The people learning them now are already setting their own rates.",
    tags: ["AI Strategy", "Career", "Automation"],
    accent: "amber",
    readTime: "8 min",
    topicCount: 7,
    topics: [
      {
        title: "AI System Architecture",
        summary:
          "Designing systems where AI, automation, and humans work together. A thinking skill, not a technical skill - understanding business operations, data flow, and how pieces connect.",
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
          "Evaluating AI output at scale - catching errors, identifying generic versus useful output, building systems for consistent quality. Bad AI output is expensive.",
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
    title: "10 Decisions That Separate Builders Who Ship From Builders Who Don't",
    hook: "Defaults for a Next.js SaaS MVP. You're not slow because you're a bad developer - you're slow because of tool choices that feel professional but add weeks of work you don't need yet.",
    tags: ["Development", "Shipping", "Tools"],
    accent: "toxic",
    readTime: "8 min",
    topicCount: 10,
    topics: [
      {
        title: "Ready-Made Auth",
        summary:
          "Clerk or Supabase Auth. Stop spending 2 weeks on sessions and OAuth for an MVP nobody has validated yet.",
      },
      {
        title: "Tailwind + shadcn/ui",
        summary:
          "Figma to working UI in hours. Accessible primitives included. Highest ROI UI decision for this stack.",
      },
      {
        title: "Zustand + Server Components",
        summary:
          "No Redux. No 6-layer Context wrappers. Zustand for client state; Server Components for the rest.",
      },
      {
        title: "tRPC + Server Actions",
        summary:
          "End-to-end type safety without a custom API layer that eats days of boilerplate.",
      },
      {
        title: "Vercel + Preview Deploys",
        summary:
          "Push to main ships. Every PR gets a preview URL. Manual server config is a productivity trap.",
      },
      {
        title: "Prisma + Managed Postgres",
        summary:
          "Typed ORM + Supabase/Neon/Railway. Handles 95% of what an MVP needs without friction.",
      },
      {
        title: "Zod + Stripe + Env Secrets",
        summary:
          "Validate inputs, never build payments, never hardcode keys. Three traps that look optional until they aren't.",
      },
      {
        title: "Sentry + Analytics on Day 1",
        summary:
          "Know what broke and how users move. Guessing for 3 months is how you build the wrong thing.",
      },
      {
        title: "README + Predictable Folders",
        summary:
          "20 minutes of structure saves hours later. Components, hooks, utils, types - keep it boring.",
      },
      {
        title: "Empty States + Lighthouse Before Launch",
        summary:
          "Confused users leave. Slow apps lose the rest. Fix both before you call it shipped.",
      },
    ],
  },
] as const;

export const SYSTEM_LAYERS: readonly SystemLayer[] = [
  {
    name: "Intelligence Layer",
    description:
      "Sybil + Alpha Agent provide macro signals, scenario analysis, and regime detection across 68 series",
    icon: "monitor",
    accent: "amber",
  },
  {
    name: "Execution Layer",
    description:
      "V33 and Copybot turn those signals into decisions autonomously, unattended, 24/7",
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
  },
  {
    name: "Intel Digest",
    stack: "Python + Gemini",
    description:
      "AI-powered news curation across 4 channels - tech, wellness, jobs, and personal. LLM-scored with customizable delivery.",
    accent: "toxic",
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
