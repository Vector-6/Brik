import type { FAQSection, FAQTopic } from "../types";

export const faqTopics: FAQTopic[] = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "general",
    label: "General",
    description: "Platform overview and the basics of Brik",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Everything you need to get started",
  },
  {
    id: "pricing",
    label: "Pricing & Limits",
    description: "Fees, limits, and settlement timelines",
  },
  {
    id: "security",
    label: "Security",
    description: "Safety, custody, and compliance guarantees",
  },
  {
    id: "trading",
    label: "Trading",
    description: "Execution, liquidity, and portfolio management",
  },
];

export const faqSections: FAQSection[] = [
  {
    id: "general-overview",
    title: "General",
    categoryId: "general",
    description:
      "Understand what Brik does, why we exist, and how we help you unlock liquidity from real-world assets.",
    highlight: "Trusted by institutional allocators and on-chain natives.",
    items: [
      {
        id: "what-is-brik",
        question: "What is Brik?",
        answer:
          "Brik is a capital markets platform that connects digital asset investors with tokenized real-world assets (RWAs). We provide a single interface to access fixed-income opportunities, commodities, and private credit without leaving the crypto ecosystem.",
        categoryId: "general",
        tags: ["overview", "platform"],
      },
      {
        id: "who-can-use-brik",
        question: "Who can use Brik?",
        answer:
          "Brik is designed for funds, trading desks, DAOs, and high-net-worth investors who need compliant access to RWAs. Individual investors can request access, and our onboarding team will guide you through eligibility requirements.",
        categoryId: "general",
        tags: ["eligibility", "investors"],
      },
      {
        id: "how-does-brik-create-value",
        question: "How does Brik create value?",
        answer:
          "We aggregate vetted issuers, automate diligence, and provide real-time analytics so you can deploy capital confidently. Our execution layer handles asset discovery, risk scoring, and settlement to keep your team focused on strategy.",
        categoryId: "general",
        tags: ["value", "benefits"],
      },
      {
        id: "which-chains-are-supported",
        question: "Which chains does Brik support?",
        answer:
          "Brik natively supports Ethereum mainnet, Arbitrum, and other EVM-compatible networks. We are actively expanding coverage for additional Layer 2s and are exploring select non-EVM chains where institutional demand exists.",
        categoryId: "general",
        tags: ["networks", "chains"],
      },
    ],
  },
  {
    id: "getting-started",
    title: "Onboarding",
    categoryId: "onboarding",
    description:
      "From creating an account to completing compliance checks, these answers cover the first steps.",
    highlight: "Average onboarding time is less than 10 minutes.",
    items: [
      {
        id: "create-account",
        question: "How do I create an account?",
        answer:
          "Start by selecting ‘Get Started’ and connecting a wallet. We will verify ownership, collect basic business information, and schedule a quick KYC/KYB review if required.",
        categoryId: "onboarding",
        tags: ["account", "signup"],
      },
      {
        id: "kyc-process",
        question: "What information is required for KYC/KYB?",
        answer:
          "We request legal entity documents, beneficial ownership details, and authorization to transact. Our compliance partner securely stores this data and supports most jurisdictions globally.",
        categoryId: "onboarding",
        tags: ["compliance", "documentation"],
      },
      {
        id: "connect-wallet",
        question: "Can I connect multiple wallets?",
        answer:
          "Yes. After your primary wallet is approved, you can add additional signing wallets for operations, treasury, or cold storage. Permissions can be managed directly from your account dashboard.",
        categoryId: "onboarding",
        tags: ["wallet", "permissions"],
      },
      {
        id: "team-access",
        question: "How do I invite teammates?",
        answer:
          "Workspace admins can invite teammates via email or wallet address. Each role has tailored permissions so compliance leads, traders, and finance teams only see what they need.",
        categoryId: "onboarding",
        tags: ["team", "roles"],
      },
    ],
  },
  {
    id: "pricing-insights",
    title: "Pricing & Limits",
    categoryId: "pricing",
    description:
      "Learn how we price transactions, the fees we charge, and the minimum order sizes we support.",
    highlight: "Zero hidden fees, and volume pricing for active desks.",
    items: [
      {
        id: "fees-structure",
        question: "What fees does Brik charge?",
        answer:
          "Brik charges a transparent platform fee on executed trades that ranges between 15 and 40 basis points depending on the asset and volume tier. Custody, issuer, or on-chain settlement fees are always disclosed before you confirm an order.",
        categoryId: "pricing",
        tags: ["fees", "pricing"],
      },
      {
        id: "minimum-order-size",
        question: "Is there a minimum order size?",
        answer:
          "Minimum allocations start at $25,000 equivalent for most issuances. For bespoke deals or secondary market blocks, speak with our team to structure an order that matches your mandate.",
        categoryId: "pricing",
        tags: ["minimum", "allocation"],
      },
      {
        id: "settlement-timing",
        question: "How long does settlement take?",
        answer:
          "On-chain settlements typically finalize within minutes once both counterparties approve. Off-chain settlements, such as bank wires related to fiat legs, may take 1-2 business days depending on your banking partner.",
        categoryId: "pricing",
        tags: ["settlement", "timing"],
      },
      {
        id: "reporting-costs",
        question: "Are reporting tools included?",
        answer:
          "Advanced analytics, API access, and exportable compliance reports are included in your subscription. For custom integrations, we offer white-glove support with a separate statement of work.",
        categoryId: "pricing",
        tags: ["reporting", "analytics"],
      },
    ],
  },
  {
    id: "security-and-trust",
    title: "Security",
    categoryId: "security",
    description:
      "Security is foundational. These answers cover custody, audits, and operational safeguards.",
    highlight: "Institutional-grade custody and continuous monitoring.",
    items: [
      {
        id: "asset-custody",
        question: "How are assets custodied?",
        answer:
          "Digital assets remain in segregated smart contracts audited by third parties, while physical collateral is held with regulated custodians. We never rehypothecate or reuse your assets.",
        categoryId: "security",
        tags: ["custody", "compliance"],
      },
      {
        id: "smart-contract-audits",
        question: "Are the smart contracts audited?",
        answer:
          "Yes. All production contracts undergo multiple independent audits and continuous monitoring. We publish public audit reports and provide real-time status in the security center.",
        categoryId: "security",
        tags: ["audit", "smart-contract"],
      },
      {
        id: "data-protection",
        question: "How does Brik handle data protection?",
        answer:
          "We comply with SOC 2, GDPR, and other applicable frameworks. Sensitive information is encrypted in transit and at rest, and access is restricted with role-based controls and hardware security modules.",
        categoryId: "security",
        tags: ["data", "privacy"],
      },
      {
        id: "incident-response",
        question: "What is Brik's incident response plan?",
        answer:
          "Our security operations center monitors threats 24/7. If an incident occurs, we notify impacted clients within minutes, initiate containment procedures, and provide post-incident reports with remediation steps.",
        categoryId: "security",
        tags: ["incident", "response"],
      },
    ],
  },
  {
    id: "trading-experience",
    title: "Trading Experience",
    categoryId: "trading",
    description:
      "Discover how execution works, where liquidity comes from, and what tools you can use to monitor performance.",
    highlight: "Direct issuer access with programmatic execution tools.",
    items: [
      {
        id: "liquidity-sources",
        question: "Where does liquidity come from?",
        answer:
          "Brik aggregates liquidity from primary issuers, secondary markets, and our own network of market participants. Orders are routed intelligently to minimize slippage while respecting issuer compliance rules.",
        categoryId: "trading",
        tags: ["liquidity", "routing"],
      },
      {
        id: "continuous-pricing",
        question: "Do you support continuous pricing?",
        answer:
          "Yes. Streaming quotes are available for select tokenized T-bills, commodities, and private credit pools. You can subscribe via the dashboard or our APIs to embed pricing in your internal systems.",
        categoryId: "trading",
        tags: ["pricing", "streaming"],
      },
      {
        id: "portfolio-analytics",
        question: "How can I track performance?",
        answer:
          "Our portfolio analytics suite includes mark-to-market valuations, cash flow schedules, and automated exposure breakdowns. Export data to CSV or integrate via API for deeper modeling.",
        categoryId: "trading",
        tags: ["analytics", "reporting"],
      },
      {
        id: "support-availability",
        question: "When is the trading desk available?",
        answer:
          "The Brik trading desk operates 24/5 with weekend coverage for mission critical events. You can reach us via in-app chat, email, or by booking a call directly from the support center.",
        categoryId: "trading",
        tags: ["support", "desk"],
      },
    ],
  },
];
