export type ToolCategory = 
  | 'Search & Web' 
  | 'Browser Automation' 
  | 'Code Sandbox' 
  | 'Scraping & Parsing' 
  | 'Audio & Speech' 
  | 'Memory & Vector';

export interface ToolProviderEndpoint {
  id: string;
  name: string;
  logoUrl?: string;
  isVerified: boolean;
  costPer1kCalls: number;
  cacheReadPer1k?: number;
  avgLatencyMs: number;
  throughputRps: number; // requests per second
  uptimePercentage: number;
  region: string; // 'Global' | 'US-East' | 'EU-Central'
}

export interface ToolBenchmarkScore {
  metricName: string;
  score: number;
  maxScore: number;
  percentile: number;
  description: string;
}

export interface ToolUsageApp {
  id: string;
  name: string;
  icon?: string;
  description: string;
  totalVolumeFormatted: string; // e.g. "597M calls"
}

export interface ToolActivityPoint {
  date: string;
  successfulCalls: number;
  failedCalls: number;
  cachedCalls: number;
}

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolDetail {
  id: string;
  slug: string; // e.g. "serper/google-search" or "daytona/code-sandbox"
  name: string;
  providerName: string;
  providerLogo?: string;
  shortDescription: string;
  fullDescription: string;
  category: ToolCategory;
  modalities: {
    inputs: ('Text' | 'DOM' | 'Code' | 'Audio' | 'Image' | 'JSON')[];
    outputs: ('Structured JSON' | 'DOM State' | 'Execution Result' | 'Audio Stream' | 'Text' | 'Image')[];
  };
  pricingSummary: string; // e.g. "$0.001 / call"
  maxConcurrency: string; // e.g. "100 parallel tasks"
  releaseDate: string;
  endpoints: ToolProviderEndpoint[];
  benchmarks: ToolBenchmarkScore[];
  topApps: ToolUsageApp[];
  activityHistory: ToolActivityPoint[];
  faqs: ToolFAQ[];
  relatedToolsSlugs: string[];
}
