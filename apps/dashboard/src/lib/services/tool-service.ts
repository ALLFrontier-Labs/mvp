import { ToolDetail } from '../../types/tool-detail';

export const TOOL_REGISTRY: Record<string, ToolDetail> = {
  'serper/google-search': {
    id: 'serper-google-search',
    slug: 'serper/google-search',
    name: 'Serper.dev Google Search Engine',
    providerName: 'Serper',
    shortDescription: 'High-concurrency Google Search API adapter with structured JSON results, knowledge graph snippets, and news citations.',
    fullDescription: 'Serper.dev provides real-time Google search results formatted for autonomous AI agents. The LiteDaemon BYOK proxy automatically manages API key failovers, micro-debites BYOK routing fees, and strips sensitive payload data for 100% ephemeral memory-only execution.',
    category: 'Search & Web',
    modalities: {
      inputs: ['Text', 'JSON'],
      outputs: ['Structured JSON', 'Text'],
    },
    pricingSummary: '$0.0010 / call',
    maxConcurrency: '500 parallel queries',
    releaseDate: '2026-01-15',
    endpoints: [
      {
        id: 'serper-us-east',
        name: 'Serper US-East Primary',
        isVerified: true,
        costPer1kCalls: 1.00,
        cacheReadPer1k: 0.10,
        avgLatencyMs: 14.2,
        throughputRps: 250,
        uptimePercentage: 99.99,
        region: 'US-East',
      },
      {
        id: 'serper-eu-central',
        name: 'Serper EU Fallback',
        isVerified: true,
        costPer1kCalls: 1.05,
        cacheReadPer1k: 0.12,
        avgLatencyMs: 18.5,
        throughputRps: 180,
        uptimePercentage: 99.95,
        region: 'EU-Central',
      },
    ],
    benchmarks: [
      {
        metricName: 'Result Freshness',
        score: 99.4,
        maxScore: 100,
        percentile: 98,
        description: 'Index latency for breaking news and real-time events.',
      },
      {
        metricName: 'JSON Schema Compliance',
        score: 100,
        maxScore: 100,
        percentile: 100,
        description: 'Strict adherence to OpenAI tool-use function calling specifications.',
      },
    ],
    topApps: [
      { id: 'app-1', name: 'AutoGPT Research Agent', description: 'Autonomous deep-research agent pipeline.', totalVolumeFormatted: '597M calls' },
      { id: 'app-2', name: 'CrewAI Market Monitor', description: 'Real-time competitive intelligence bot.', totalVolumeFormatted: '312M calls' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1420000, failedCalls: 12, cachedCalls: 310000 },
      { date: '2026-07-26', successfulCalls: 1580000, failedCalls: 8, cachedCalls: 340000 },
      { date: '2026-07-27', successfulCalls: 1650000, failedCalls: 15, cachedCalls: 380000 },
      { date: '2026-07-28', successfulCalls: 1720000, failedCalls: 5, cachedCalls: 410000 },
      { date: '2026-07-29', successfulCalls: 1890000, failedCalls: 9, cachedCalls: 450000 },
      { date: '2026-07-30', successfulCalls: 2100000, failedCalls: 4, cachedCalls: 510000 },
    ],
    faqs: [
      {
        question: 'How does LiteDaemon optimize Serper API calls?',
        answer: 'LiteDaemon automatically handles key rotation across your configured BYOK keys to prevent 429 quota limits, while micro-debiting fees from your wallet after 100 free monthly requests.',
      },
      {
        question: 'Is query data stored?',
        answer: 'No. LiteDaemon operates a memory-only pass-through proxy. Search query parameters and response payloads stream in real time and are never saved to disk.',
      },
    ],
    relatedToolsSlugs: ['perplexity/sonar-search', 'tavily/web-search'],
  },

  'perplexity/sonar-search': {
    id: 'perplexity-sonar-search',
    slug: 'perplexity/sonar-search',
    name: 'Perplexity Sonar Deep Search',
    providerName: 'Perplexity',
    shortDescription: 'AI-native online reasoning engine offering real-time web grounding with inline source citations.',
    fullDescription: 'Perplexity Sonar combines real-time search indexing with deep reasoning models to answer complex research queries for AI agents. Routed via LiteDaemon BYOK for zero rate-limit downtime.',
    category: 'Search & Web',
    modalities: {
      inputs: ['Text'],
      outputs: ['Structured JSON', 'Text'],
    },
    pricingSummary: '$0.0050 / call',
    maxConcurrency: '200 parallel tasks',
    releaseDate: '2026-02-01',
    endpoints: [
      {
        id: 'perplexity-global',
        name: 'Perplexity Global Primary',
        isVerified: true,
        costPer1kCalls: 5.00,
        cacheReadPer1k: 0.50,
        avgLatencyMs: 120.5,
        throughputRps: 150,
        uptimePercentage: 99.98,
        region: 'Global',
      },
    ],
    benchmarks: [
      {
        metricName: 'Citation Accuracy',
        score: 98.2,
        maxScore: 100,
        percentile: 97,
        description: 'Verification of URL source relevance in output markdown.',
      },
    ],
    topApps: [
      { id: 'app-3', name: 'OpenDevin Research Subagent', description: 'Code analysis and online documentation search.', totalVolumeFormatted: '184M calls' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 890000, failedCalls: 3, cachedCalls: 120000 },
      { date: '2026-07-26', successfulCalls: 940000, failedCalls: 2, cachedCalls: 135000 },
      { date: '2026-07-27', successfulCalls: 980000, failedCalls: 6, cachedCalls: 140000 },
      { date: '2026-07-28', successfulCalls: 1050000, failedCalls: 1, cachedCalls: 160000 },
      { date: '2026-07-29', successfulCalls: 1120000, failedCalls: 4, cachedCalls: 175000 },
      { date: '2026-07-30', successfulCalls: 1250000, failedCalls: 2, cachedCalls: 190000 },
    ],
    faqs: [
      {
        question: 'Does Sonar support multi-turn search sessions?',
        answer: 'Yes, passing conversation context array in params allows multi-step research sessions via LiteDaemon gateway.',
      },
    ],
    relatedToolsSlugs: ['serper/google-search', 'tavily/web-search'],
  },

  'steel/browser-automation': {
    id: 'steel-browser-automation',
    slug: 'steel/browser-automation',
    name: 'Steel Browser Automation Sandbox',
    providerName: 'Steel',
    shortDescription: 'Production-ready headless browser infrastructure designed specifically for autonomous web agents.',
    fullDescription: 'Steel Browser provides dedicated Chrome browser sessions managed via Playwright/Puppeteer CDP interfaces. LiteDaemon proxies session creation and websocket endpoints with automated auth key vault protection.',
    category: 'Browser Automation',
    modalities: {
      inputs: ['DOM', 'Code', 'Text'],
      outputs: ['DOM State', 'Execution Result', 'Image'],
    },
    pricingSummary: '$0.0050 / session min',
    maxConcurrency: '100 parallel sessions',
    releaseDate: '2026-03-10',
    endpoints: [
      {
        id: 'steel-us-east',
        name: 'Steel US-East Cluster',
        isVerified: true,
        costPer1kCalls: 5.00,
        avgLatencyMs: 35.0,
        throughputRps: 80,
        uptimePercentage: 99.90,
        region: 'US-East',
      },
    ],
    benchmarks: [
      {
        metricName: 'Anti-Bot Stealth Score',
        score: 99.8,
        maxScore: 100,
        percentile: 99,
        description: 'Bypass rate on Cloudflare & Akamai stealth challenges.',
      },
    ],
    topApps: [
      { id: 'app-4', name: 'Browser-Use Web Agent', description: 'Autonomous browser navigation & form submission.', totalVolumeFormatted: '410M sessions' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 320000, failedCalls: 18, cachedCalls: 10000 },
      { date: '2026-07-26', successfulCalls: 350000, failedCalls: 12, cachedCalls: 12000 },
      { date: '2026-07-27', successfulCalls: 380000, failedCalls: 22, cachedCalls: 15000 },
      { date: '2026-07-28', successfulCalls: 410000, failedCalls: 9, cachedCalls: 18000 },
      { date: '2026-07-29', successfulCalls: 460000, failedCalls: 14, cachedCalls: 21000 },
      { date: '2026-07-30', successfulCalls: 510000, failedCalls: 7, cachedCalls: 25000 },
    ],
    faqs: [
      {
        question: 'Can I connect via Playwright directly?',
        answer: 'Yes. Point your Playwright chromium.connectOverCDP() URL to litedaemon.xyz/v1/browser.',
      },
    ],
    relatedToolsSlugs: ['browserbase/cdp-session', 'firecrawl/web-scraper'],
  },

  'daytona/code-sandbox': {
    id: 'daytona-code-sandbox',
    slug: 'daytona/code-sandbox',
    name: 'Daytona Isolated Code Sandbox',
    providerName: 'Daytona',
    shortDescription: 'Sub-second secure MicroVM environments for executing untrusted agent-generated Python, JS, and Bash code.',
    fullDescription: 'Daytona delivers ephemeral, isolated MicroVM sandboxes pre-loaded with developer runtimes. LiteDaemon handles instant container provisioning and result streaming with zero persistent state.',
    category: 'Code Sandbox',
    modalities: {
      inputs: ['Code', 'Text'],
      outputs: ['Execution Result', 'Structured JSON'],
    },
    pricingSummary: '$0.0020 / execution',
    maxConcurrency: '300 sandboxes',
    releaseDate: '2026-01-20',
    endpoints: [
      {
        id: 'daytona-global',
        name: 'Daytona MicroVM Pool',
        isVerified: true,
        costPer1kCalls: 2.00,
        avgLatencyMs: 8.4,
        throughputRps: 400,
        uptimePercentage: 99.99,
        region: 'Global',
      },
    ],
    benchmarks: [
      {
        metricName: 'Sandbox Spin-up Time',
        score: 99.9,
        maxScore: 100,
        percentile: 99,
        description: 'MicroVM creation overhead (<10ms target).',
      },
    ],
    topApps: [
      { id: 'app-5', name: 'OpenHands Coding Agent', description: 'Autonomous software engineering sub-agent.', totalVolumeFormatted: '720M executions' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 950000, failedCalls: 4, cachedCalls: 80000 },
      { date: '2026-07-26', successfulCalls: 1020000, failedCalls: 2, cachedCalls: 95000 },
      { date: '2026-07-27', successfulCalls: 1100000, failedCalls: 5, cachedCalls: 105000 },
      { date: '2026-07-28', successfulCalls: 1180000, failedCalls: 3, cachedCalls: 120000 },
      { date: '2026-07-29', successfulCalls: 1300000, failedCalls: 1, cachedCalls: 140000 },
      { date: '2026-07-30', successfulCalls: 1450000, failedCalls: 2, cachedCalls: 160000 },
    ],
    faqs: [
      {
        question: 'Which programming languages are supported?',
        answer: 'Python 3.12, Node.js v22, Go 1.22, Rust, and Bash out of the box.',
      },
    ],
    relatedToolsSlugs: ['e2b/code-sandbox', 'llamaparse/document-parser'],
  },

  'assemblyai/transcribe': {
    id: 'assemblyai-transcribe',
    slug: 'assemblyai/transcribe',
    name: 'AssemblyAI Speech Transcribe Engine',
    providerName: 'AssemblyAI',
    shortDescription: 'State-of-the-art speech recognition, speaker diarization, and audio intelligence API for AI workflows.',
    fullDescription: 'AssemblyAI translates audio files and real-time streams into structured transcripts with timestamps and speaker tags. Proxy through LiteDaemon BYOK for unified billing and zero payload storage.',
    category: 'Audio & Speech',
    modalities: {
      inputs: ['Audio'],
      outputs: ['Structured JSON', 'Text'],
    },
    pricingSummary: '$0.0030 / audio min',
    maxConcurrency: '150 streams',
    releaseDate: '2026-02-15',
    endpoints: [
      {
        id: 'assemblyai-us',
        name: 'AssemblyAI US Primary',
        isVerified: true,
        costPer1kCalls: 3.00,
        avgLatencyMs: 45.0,
        throughputRps: 120,
        uptimePercentage: 99.96,
        region: 'US-East',
      },
    ],
    benchmarks: [
      {
        metricName: 'Word Error Rate (WER)',
        score: 96.8,
        maxScore: 100,
        percentile: 95,
        description: 'Accuracy across noisy multi-speaker audio recordings.',
      },
    ],
    topApps: [
      { id: 'app-6', name: 'CallSummarizer Bot', description: 'Automated sales call transcription & CRM tagging.', totalVolumeFormatted: '140M audio mins' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 210000, failedCalls: 5, cachedCalls: 5000 },
      { date: '2026-07-26', successfulCalls: 230000, failedCalls: 3, cachedCalls: 6000 },
      { date: '2026-07-27', successfulCalls: 250000, failedCalls: 8, cachedCalls: 7500 },
      { date: '2026-07-28', successfulCalls: 280000, failedCalls: 2, cachedCalls: 9000 },
      { date: '2026-07-29', successfulCalls: 310000, failedCalls: 4, cachedCalls: 11000 },
      { date: '2026-07-30', successfulCalls: 350000, failedCalls: 1, cachedCalls: 13000 },
    ],
    faqs: [
      {
        question: 'Does AssemblyAI support live streaming websocket audio?',
        answer: 'Yes, LiteDaemon supports websocket pass-through proxying for real-time transcription.',
      },
    ],
    relatedToolsSlugs: ['mem0/long-term-memory', 'serper/google-search'],
  },

  'mem0/long-term-memory': {
    id: 'mem0-long-term-memory',
    slug: 'mem0/long-term-memory',
    name: 'Mem0 Long-Term Agent Memory Store',
    providerName: 'Mem0',
    shortDescription: 'Self-improving memory layer for AI agents that extracts, indexes, and retrieves user preferences over time.',
    fullDescription: 'Mem0 provides persistent memory vectors for personalization and multi-session continuity. LiteDaemon proxies memory reads and writes with AES-256 encrypted credential protection.',
    category: 'Memory & Vector',
    modalities: {
      inputs: ['Text', 'JSON'],
      outputs: ['Structured JSON'],
    },
    pricingSummary: '$0.0010 / memory op',
    maxConcurrency: '1000 parallel reads',
    releaseDate: '2026-03-01',
    endpoints: [
      {
        id: 'mem0-global',
        name: 'Mem0 Memory Router',
        isVerified: true,
        costPer1kCalls: 1.00,
        avgLatencyMs: 6.2,
        throughputRps: 600,
        uptimePercentage: 99.99,
        region: 'Global',
      },
    ],
    benchmarks: [
      {
        metricName: 'Retrieval Recall @ 10',
        score: 99.1,
        maxScore: 100,
        percentile: 98,
        description: 'Accuracy of relevant memory fact retrieval.',
      },
    ],
    topApps: [
      { id: 'app-7', name: 'Personal AI Companion', description: 'Long-term user preference memory sub-agent.', totalVolumeFormatted: '890M ops' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1800000, failedCalls: 2, cachedCalls: 450000 },
      { date: '2026-07-26', successfulCalls: 1950000, failedCalls: 1, cachedCalls: 490000 },
      { date: '2026-07-27', successfulCalls: 2100000, failedCalls: 3, cachedCalls: 530000 },
      { date: '2026-07-28', successfulCalls: 2300000, failedCalls: 0, cachedCalls: 580000 },
      { date: '2026-07-29', successfulCalls: 2500000, failedCalls: 2, cachedCalls: 630000 },
      { date: '2026-07-30', successfulCalls: 2800000, failedCalls: 1, cachedCalls: 700000 },
    ],
    faqs: [
      {
        question: 'Are user memories private?',
        answer: 'Yes, memories are indexed using your private tenant key. LiteDaemon never logs memory contents.',
      },
    ],
    relatedToolsSlugs: ['serper/google-search', 'daytona/code-sandbox'],
  },

  'tavily/web-search': {
    id: 'tavily-web-search',
    slug: 'tavily/web-search',
    name: 'Tavily AI Search Engine',
    providerName: 'Tavily',
    shortDescription: 'Search engine optimized specifically for LLMs and autonomous agents with clean content extractions.',
    fullDescription: 'Tavily delivers clean, accurate, and context-rich search results designed for LLM prompts.',
    category: 'Search & Web',
    modalities: { inputs: ['Text'], outputs: ['Structured JSON'] },
    pricingSummary: '$0.0010 / call',
    maxConcurrency: '400 queries',
    releaseDate: '2026-01-10',
    endpoints: [
      { id: 'tavily-us', name: 'Tavily US Cluster', isVerified: true, costPer1kCalls: 1.00, avgLatencyMs: 16.0, throughputRps: 300, uptimePercentage: 99.99, region: 'US-East' },
    ],
    benchmarks: [
      { metricName: 'LLM Relevancy', score: 98.9, maxScore: 100, percentile: 98, description: 'Prompt answer quality.' },
    ],
    topApps: [
      { id: 'app-8', name: 'LangChain Agent', description: 'General research assistant.', totalVolumeFormatted: '620M calls' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1500000, failedCalls: 10, cachedCalls: 300000 },
      { date: '2026-07-30', successfulCalls: 2200000, failedCalls: 3, cachedCalls: 500000 },
    ],
    faqs: [
      { question: 'Does Tavily return raw HTML?', answer: 'It returns cleaned markdown and optional raw content.' },
    ],
    relatedToolsSlugs: ['serper/google-search', 'perplexity/sonar-search'],
  },

  'firecrawl/web-scraper': {
    id: 'firecrawl-web-scraper',
    slug: 'firecrawl/web-scraper',
    name: 'Firecrawl Web Scraper & Crawler',
    providerName: 'Firecrawl',
    shortDescription: 'Turn any website into clean markdown or structured data for LLM intake.',
    fullDescription: 'Firecrawl crawls and converts web pages directly into LLM-ready markdown.',
    category: 'Scraping & Parsing',
    modalities: { inputs: ['DOM', 'Text'], outputs: ['Structured JSON', 'Text'] },
    pricingSummary: '$0.0030 / page',
    maxConcurrency: '250 pages',
    releaseDate: '2026-02-05',
    endpoints: [
      { id: 'firecrawl-us', name: 'Firecrawl Scraper Pool', isVerified: true, costPer1kCalls: 3.00, avgLatencyMs: 28.0, throughputRps: 200, uptimePercentage: 99.95, region: 'Global' },
    ],
    benchmarks: [
      { metricName: 'Markdown Extraction Quality', score: 99.2, maxScore: 100, percentile: 99, description: 'Clean document conversion.' },
    ],
    topApps: [
      { id: 'app-9', name: 'LlamaIndex Crawler', description: 'Documentation indexing bot.', totalVolumeFormatted: '450M pages' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1100000, failedCalls: 15, cachedCalls: 200000 },
      { date: '2026-07-30', successfulCalls: 1700000, failedCalls: 5, cachedCalls: 320000 },
    ],
    faqs: [
      { question: 'Can Firecrawl handle dynamic JS apps?', answer: 'Yes, it renders JavaScript using headless browser instances.' },
    ],
    relatedToolsSlugs: ['steel/browser-automation', 'tavily/web-search'],
  },

  'browserbase/cdp-session': {
    id: 'browserbase-cdp-session',
    slug: 'browserbase/cdp-session',
    name: 'Browserbase CDP Session Platform',
    providerName: 'Browserbase',
    shortDescription: 'Developer-first headless browser platform to run, debug, and scale web automation.',
    fullDescription: 'Browserbase offers headless Chrome instances with built-in stealth modes and session recordings.',
    category: 'Browser Automation',
    modalities: { inputs: ['DOM', 'Code'], outputs: ['DOM State', 'Execution Result'] },
    pricingSummary: '$0.0050 / min',
    maxConcurrency: '150 sessions',
    releaseDate: '2026-01-30',
    endpoints: [
      { id: 'browserbase-us', name: 'Browserbase Cluster', isVerified: true, costPer1kCalls: 5.00, avgLatencyMs: 40.0, throughputRps: 100, uptimePercentage: 99.92, region: 'US-East' },
    ],
    benchmarks: [
      { metricName: 'Stealth Pass Rate', score: 99.5, maxScore: 100, percentile: 98, description: 'Anti-bot challenge clearance.' },
    ],
    topApps: [
      { id: 'app-10', name: 'AgentOps Browser', description: 'Automated web QA agent.', totalVolumeFormatted: '280M sessions' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 400000, failedCalls: 20, cachedCalls: 15000 },
      { date: '2026-07-30', successfulCalls: 650000, failedCalls: 8, cachedCalls: 30000 },
    ],
    faqs: [
      { question: 'Does it record video sessions?', answer: 'Yes, session recordings can be enabled per proxy call.' },
    ],
    relatedToolsSlugs: ['steel/browser-automation', 'firecrawl/web-scraper'],
  },

  'e2b/code-sandbox': {
    id: 'e2b-code-sandbox',
    slug: 'e2b/code-sandbox',
    name: 'E2B MicroVM Code Sandbox',
    providerName: 'E2B',
    shortDescription: 'Secure open-source cloud environment for AI agents to run code safely.',
    fullDescription: 'E2B provides sandboxed Linux MicroVMs for LLMs to execute code and build applications.',
    category: 'Code Sandbox',
    modalities: { inputs: ['Code'], outputs: ['Execution Result'] },
    pricingSummary: '$0.0020 / execution',
    maxConcurrency: '400 sandboxes',
    releaseDate: '2026-01-05',
    endpoints: [
      { id: 'e2b-global', name: 'E2B MicroVM Engine', isVerified: true, costPer1kCalls: 2.00, avgLatencyMs: 10.0, throughputRps: 350, uptimePercentage: 99.98, region: 'Global' },
    ],
    benchmarks: [
      { metricName: 'Isolation Security', score: 100, maxScore: 100, percentile: 100, description: 'Firecracker MicroVM isolation.' },
    ],
    topApps: [
      { id: 'app-11', name: 'Camel AI Coder', description: 'Autonomous software generator.', totalVolumeFormatted: '810M executions' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1200000, failedCalls: 5, cachedCalls: 100000 },
      { date: '2026-07-30', successfulCalls: 1900000, failedCalls: 2, cachedCalls: 210000 },
    ],
    faqs: [
      { question: 'Can I install custom pip/npm packages?', answer: 'Yes, full sudo and package manager access is supported.' },
    ],
    relatedToolsSlugs: ['daytona/code-sandbox', 'llamaparse/document-parser'],
  },

  'llamaparse/document-parser': {
    id: 'llamaparse-document-parser',
    slug: 'llamaparse/document-parser',
    name: 'LlamaParse PDF & Document Engine',
    providerName: 'LlamaIndex',
    shortDescription: 'GenAI-native document parsing service for complex PDFs, tables, and charts.',
    fullDescription: 'LlamaParse parses complex PDF layouts into clean structured markdown and JSON tables.',
    category: 'Scraping & Parsing',
    modalities: { inputs: ['Image', 'Text'], outputs: ['Structured JSON', 'Text'] },
    pricingSummary: '$0.0030 / page',
    maxConcurrency: '200 pages',
    releaseDate: '2026-02-20',
    endpoints: [
      { id: 'llamaparse-us', name: 'LlamaParse Engine', isVerified: true, costPer1kCalls: 3.00, avgLatencyMs: 50.0, throughputRps: 150, uptimePercentage: 99.94, region: 'US-East' },
    ],
    benchmarks: [
      { metricName: 'Table Parsing Accuracy', score: 98.4, maxScore: 100, percentile: 97, description: 'Extraction of complex financial tables.' },
    ],
    topApps: [
      { id: 'app-12', name: 'RAG Pipeline Bot', description: 'Financial report ingestion pipeline.', totalVolumeFormatted: '310M pages' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 500000, failedCalls: 8, cachedCalls: 50000 },
      { date: '2026-07-30', successfulCalls: 820000, failedCalls: 3, cachedCalls: 110000 },
    ],
    faqs: [
      { question: 'Does it parse images inside PDFs?', answer: 'Yes, it extracts images and performs embedded OCR.' },
    ],
    relatedToolsSlugs: ['daytona/code-sandbox', 'tavily/web-search'],
  },

  'bing/web-search': {
    id: 'bing-web-search',
    slug: 'bing/web-search',
    name: 'Bing Web Search Engine',
    providerName: 'Microsoft Bing',
    shortDescription: 'Enterprise Bing Web Search API with structured web results, news, and knowledge graph citations.',
    fullDescription: 'Bing Web Search delivers high-speed web indices formatted for AI search pipelines. Routed via LiteDaemon for instant key failover and sub-cent pricing.',
    category: 'Search & Web',
    modalities: { inputs: ['Text'], outputs: ['Structured JSON', 'Text'] },
    pricingSummary: '$0.0010 / call',
    maxConcurrency: '500 parallel queries',
    releaseDate: '2026-01-20',
    endpoints: [
      { id: 'bing-us', name: 'Bing US Primary', isVerified: true, costPer1kCalls: 1.00, cacheReadPer1k: 0.10, avgLatencyMs: 15.0, throughputRps: 300, uptimePercentage: 99.99, region: 'US-East' }
    ],
    benchmarks: [
      { metricName: 'Result Freshness', score: 99.1, maxScore: 100, percentile: 98, description: 'Index freshness for breaking web content.' }
    ],
    topApps: [
      { id: 'app-bing-1', name: 'Bing Research Bot', description: 'Real-time market research pipeline.', totalVolumeFormatted: '410M calls' }
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1100000, failedCalls: 5, cachedCalls: 210000 },
      { date: '2026-07-30', successfulCalls: 1650000, failedCalls: 2, cachedCalls: 320000 }
    ],
    faqs: [
      { question: 'Does Bing Web Search support safe-search filtering?', answer: 'Yes, pass safety parameters in request params.' }
    ],
    relatedToolsSlugs: ['serper/google-search', 'tavily/web-search']
  },

  'exa/neural-search': {
    id: 'exa-neural-search',
    slug: 'exa/neural-search',
    name: 'Exa AI Neural Search',
    providerName: 'Exa',
    shortDescription: 'Embedding-based neural search engine designed to find semantically relevant web content.',
    fullDescription: 'Exa searches the web using vector embeddings rather than keywords, retrieving deep document semantics for LLMs.',
    category: 'Search & Web',
    modalities: { inputs: ['Text'], outputs: ['Structured JSON', 'Text'] },
    pricingSummary: '$0.0020 / call',
    maxConcurrency: '300 queries',
    releaseDate: '2026-02-10',
    endpoints: [
      { id: 'exa-primary', name: 'Exa Neural Gateway', isVerified: true, costPer1kCalls: 2.00, avgLatencyMs: 22.0, throughputRps: 200, uptimePercentage: 99.96, region: 'Global' }
    ],
    benchmarks: [
      { metricName: 'Semantic Precision', score: 99.6, maxScore: 100, percentile: 99, description: 'Neural relevance score.' }
    ],
    topApps: [
      { id: 'app-exa-1', name: 'Exa Deep Finder', description: 'Semantic document discovery pipeline.', totalVolumeFormatted: '280M calls' }
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 800000, failedCalls: 3, cachedCalls: 150000 },
      { date: '2026-07-30', successfulCalls: 1400000, failedCalls: 1, cachedCalls: 250000 }
    ],
    faqs: [
      { question: 'How is Exa different from keyword search?', answer: 'Exa uses embeddings to understand the meaning of your query rather than matching words.' }
    ],
    relatedToolsSlugs: ['perplexity/sonar-search', 'tavily/web-search']
  },

  'google/custom-search': {
    id: 'google-custom-search',
    slug: 'google/custom-search',
    name: 'Google Custom Search API',
    providerName: 'Google Cloud',
    shortDescription: 'Programmatic access to Google Custom Search Engine (CSE) results.',
    fullDescription: 'Access structured Google Search results filtered by domain or custom engine configurations.',
    category: 'Search & Web',
    modalities: { inputs: ['Text'], outputs: ['Structured JSON'] },
    pricingSummary: '$0.0050 / call',
    maxConcurrency: '200 queries',
    releaseDate: '2026-01-01',
    endpoints: [
      { id: 'google-cse', name: 'Google CSE Primary', isVerified: true, costPer1kCalls: 5.00, avgLatencyMs: 18.0, throughputRps: 150, uptimePercentage: 99.99, region: 'Global' }
    ],
    benchmarks: [
      { metricName: 'Domain Filter Accuracy', score: 100, maxScore: 100, percentile: 100, description: 'Strict compliance with domain scope.' }
    ],
    topApps: [
      { id: 'app-google-1', name: 'Enterprise Search Bot', description: 'Targeted domain scraper.', totalVolumeFormatted: '190M calls' }
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 500000, failedCalls: 2, cachedCalls: 100000 },
      { date: '2026-07-30', successfulCalls: 900000, failedCalls: 0, cachedCalls: 180000 }
    ],
    faqs: [
      { question: 'Do I need a CSE ID?', answer: 'Yes, configure your cx parameter in the request body.' }
    ],
    relatedToolsSlugs: ['serper/google-search', 'bing/web-search']
  },

  'duckduckgo/scraping-engine': {
    id: 'duckduckgo-scraping-engine',
    slug: 'duckduckgo/scraping-engine',
    name: 'DuckDuckGo Scraping Engine',
    providerName: 'DuckDuckGo',
    shortDescription: 'Privacy-focused zero-tracking search scraper for AI agents.',
    fullDescription: 'DuckDuckGo provides privacy-first search results without tracking user identity or search queries.',
    category: 'Search & Web',
    modalities: { inputs: ['Text'], outputs: ['Structured JSON'] },
    pricingSummary: '$0.0005 / call',
    maxConcurrency: '500 queries',
    releaseDate: '2026-01-01',
    endpoints: [
      { id: 'ddg-primary', name: 'DuckDuckGo Gateway', isVerified: true, costPer1kCalls: 0.50, avgLatencyMs: 12.0, throughputRps: 400, uptimePercentage: 99.98, region: 'Global' }
    ],
    benchmarks: [
      { metricName: 'Privacy Assurance', score: 100, maxScore: 100, percentile: 100, description: 'Zero telemetry logging.' }
    ],
    topApps: [
      { id: 'app-ddg-1', name: 'Privacy Research Agent', description: 'Anonymous data collection bot.', totalVolumeFormatted: '520M calls' }
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1400000, failedCalls: 1, cachedCalls: 300000 },
      { date: '2026-07-30', successfulCalls: 2100000, failedCalls: 0, cachedCalls: 450000 }
    ],
    faqs: [
      { question: 'Is IP proxying automatic?', answer: 'Yes, LiteDaemon rotates egress IPs automatically.' }
    ],
    relatedToolsSlugs: ['serper/google-search', 'tavily/web-search']
  },

  'jina/reader': {
    id: 'jina-reader',
    slug: 'jina/reader',
    name: 'Jina AI Reader & Web Parser',
    providerName: 'Jina AI',
    shortDescription: 'Convert any URL into clean markdown tailored for LLM prompt context windows.',
    fullDescription: 'Jina Reader strips ads, headers, and footers from web pages to produce optimal markdown for LLMs.',
    category: 'Scraping & Parsing',
    modalities: { inputs: ['DOM', 'Text'], outputs: ['Text', 'Structured JSON'] },
    pricingSummary: '$0.0010 / page',
    maxConcurrency: '400 pages',
    releaseDate: '2026-01-15',
    endpoints: [
      { id: 'jina-reader-primary', name: 'Jina Reader Engine', isVerified: true, costPer1kCalls: 1.00, avgLatencyMs: 15.0, throughputRps: 350, uptimePercentage: 99.99, region: 'Global' }
    ],
    benchmarks: [
      { metricName: 'Markdown Relevancy', score: 99.4, maxScore: 100, percentile: 99, description: 'Clean content conversion without boilerplate.' }
    ],
    topApps: [
      { id: 'app-jina-1', name: 'Jina Summarizer Bot', description: 'Instant article markdown ingestion.', totalVolumeFormatted: '630M pages' }
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1300000, failedCalls: 2, cachedCalls: 250000 },
      { date: '2026-07-30', successfulCalls: 1950000, failedCalls: 1, cachedCalls: 400000 }
    ],
    faqs: [
      { question: 'How do I pass a URL to Jina Reader?', answer: 'Send {"url": "https://example.com"} in your POST request body.' }
    ],
    relatedToolsSlugs: ['firecrawl/web-scraper', 'tavily/web-search']
  },

  'deepgram/speech-api': {
    id: 'deepgram-speech-api',
    slug: 'deepgram/speech-api',
    name: 'Deepgram Nova-2 Speech API',
    providerName: 'Deepgram',
    shortDescription: 'Ultra-fast real-time speech-to-text API powered by Nova-2 architecture.',
    fullDescription: 'Deepgram provides industry-leading speech recognition with sub-100ms streaming latency and high WER accuracy.',
    category: 'Audio & Speech',
    modalities: { inputs: ['Audio'], outputs: ['Structured JSON', 'Text'] },
    pricingSummary: '$0.0020 / audio min',
    maxConcurrency: '300 streams',
    releaseDate: '2026-02-01',
    endpoints: [
      { id: 'deepgram-nova', name: 'Deepgram Nova-2 Cluster', isVerified: true, costPer1kCalls: 2.00, avgLatencyMs: 25.0, throughputRps: 250, uptimePercentage: 99.98, region: 'US-East' }
    ],
    benchmarks: [
      { metricName: 'Streaming Latency', score: 99.9, maxScore: 100, percentile: 100, description: 'Sub-100ms real-time audio transcription.' }
    ],
    topApps: [
      { id: 'app-deepgram-1', name: 'Voice Agent Copilot', description: 'Real-time conversational voice sub-agent.', totalVolumeFormatted: '580M mins' }
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 900000, failedCalls: 4, cachedCalls: 100000 },
      { date: '2026-07-30', successfulCalls: 1500000, failedCalls: 2, cachedCalls: 200000 }
    ],
    faqs: [
      { question: 'Is Nova-2 multi-lingual?', answer: 'Yes, Nova-2 supports 30+ languages automatically.' }
    ],
    relatedToolsSlugs: ['assemblyai/transcribe', 'mem0/long-term-memory']
  }
};

function generateFallbackTool(rawSlug: string): ToolDetail {
  const parts = rawSlug.split('/').filter(Boolean);
  const providerSlug = parts[0] || 'custom';
  const toolSlug = parts[1] || parts[0] || 'engine';
  
  const providerName = providerSlug.charAt(0).toUpperCase() + providerSlug.slice(1);
  const toolNameFormatted = toolSlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
    
  const fullName = `${providerName} ${toolNameFormatted}`;
  
  return {
    id: `${providerSlug}-${toolSlug}`,
    slug: rawSlug,
    name: fullName,
    providerName: providerName,
    shortDescription: `High-concurrency ${fullName} API adapter routed via LiteDaemon zero-latency BYOK proxy.`,
    fullDescription: `${fullName} provides enterprise-grade capabilities for AI sub-agents. The LiteDaemon proxy automatically manages API key failovers, sub-cent routing fees, and memory-only execution with zero persistent logging.`,
    category: 'Search & Web',
    modalities: {
      inputs: ['Text', 'JSON'],
      outputs: ['Structured JSON', 'Text'],
    },
    pricingSummary: '$0.0010 / call',
    maxConcurrency: '300 parallel tasks',
    releaseDate: '2026-01-01',
    endpoints: [
      {
        id: `${providerSlug}-primary`,
        name: `${providerName} Primary Gateway`,
        isVerified: true,
        costPer1kCalls: 1.00,
        cacheReadPer1k: 0.10,
        avgLatencyMs: 14.5,
        throughputRps: 250,
        uptimePercentage: 99.99,
        region: 'Global',
      },
    ],
    benchmarks: [
      {
        metricName: 'JSON Schema Compliance',
        score: 99.5,
        maxScore: 100,
        percentile: 99,
        description: 'Strict adherence to function calling and agent tool execution specifications.',
      },
      {
        metricName: 'Proxy Delivery Latency',
        score: 99.9,
        maxScore: 100,
        percentile: 100,
        description: 'Sub-15ms round-trip overhead through LiteDaemon edge proxy.',
      },
    ],
    topApps: [
      { id: 'app-fallback-1', name: 'AutoGPT Pipeline', description: 'Autonomous agent workflow integration.', totalVolumeFormatted: '340M calls' },
    ],
    activityHistory: [
      { date: '2026-07-25', successfulCalls: 1200000, failedCalls: 4, cachedCalls: 200000 },
      { date: '2026-07-30', successfulCalls: 1800000, failedCalls: 2, cachedCalls: 350000 },
    ],
    faqs: [
      {
        question: `How does LiteDaemon optimize ${fullName}?`,
        answer: `LiteDaemon automatically manages multi-key rotation and failovers across your configured BYOK keys while applying zero rate-limit constraints after 100 free monthly requests.`,
      },
    ],
    relatedToolsSlugs: ['serper/google-search', 'tavily/web-search'],
  };
}

/**
 * Lookup a tool by its exact slug (e.g. "serper/google-search" or "bing/web-search")
 */
export function getToolBySlug(slug: string): ToolDetail {
  const normalized = slug.replace(/^\/+|\/+$/g, '');
  if (TOOL_REGISTRY[normalized]) {
    return TOOL_REGISTRY[normalized];
  }
  
  // Try matching by secondary path or slug ending
  const match = Object.values(TOOL_REGISTRY).find(
    t => t.slug === normalized || t.slug.endsWith(`/${normalized}`) || normalized.endsWith(`/${t.slug}`)
  );
  if (match) return match;

  return generateFallbackTool(normalized);
}

/**
 * Retrieve related tool details for a given slug
 */
export function getRelatedTools(slug: string): ToolDetail[] {
  const current = getToolBySlug(slug);
  if (!current) return [];

  return current.relatedToolsSlugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolDetail => Boolean(t));
}

/**
 * Get all registered tool slugs
 */
export function getAllToolSlugs(): string[] {
  return Object.keys(TOOL_REGISTRY);
}

/**
 * Get all registered ToolDetail objects
 */
export function getAllTools(): ToolDetail[] {
  return Object.values(TOOL_REGISTRY);
}

export interface ComparePreset {
  title: string;
  description: string;
  toolSlugs: string[];
}

export function getComparePresetsForTool(primaryTool: ToolDetail): ComparePreset[] {
  return [
    {
      title: 'Category Leaders',
      description: 'Top-rated tools in ' + primaryTool.category,
      toolSlugs: [primaryTool.slug, ...primaryTool.relatedToolsSlugs].slice(0, 3)
    },
    {
      title: 'Most Affordable',
      description: 'Lowest cost per 1k executions',
      toolSlugs: [primaryTool.slug, 'serper/google-search', 'tavily/web-search'].slice(0, 3)
    },
    {
      title: 'Fastest Latency',
      description: 'Lowest TTFT and round-trip execution',
      toolSlugs: [primaryTool.slug, 'steel/browser-automation', 'daytona/code-sandbox'].slice(0, 3)
    }
  ];
}
