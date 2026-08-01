import React from 'react';
import { Check, X, Shield, Zap, Layers, Server, Activity, HelpCircle } from 'lucide-react';

interface FeatureRow {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

interface FeatureCategory {
  category: string;
  icon: React.ElementType;
  rows: FeatureRow[];
}

const MATRIX_DATA: FeatureCategory[] = [
  {
    category: 'Gateway & Core Routing',
    icon: Zap,
    rows: [
      { name: 'Unified API Endpoints', free: 'All 5 Endpoints', pro: 'All 5 Endpoints', enterprise: 'All 5 + Custom Adapters' },
      { name: 'Provider Failover Chains', free: 'Manual', pro: 'Automatic (Primary ➔ Secondary)', enterprise: 'Custom Failover Logic' },
      { name: 'Monthly Request Limit', free: '100 / mo', pro: 'Unlimited (Metered)', enterprise: 'Custom High Throughput' },
      { name: 'Request Rate Limit', free: '60 req/min', pro: '600 req/min', enterprise: 'Custom / Unlimited' },
    ],
  },
  {
    category: 'Security & Vault Enforcement',
    icon: Shield,
    rows: [
      { name: 'Provider Key Storage', free: 'AES-256-GCM Vault', pro: 'AES-256-GCM Vault', enterprise: 'Hardware Security Module (HSM)' },
      { name: 'Master Key Authentication', free: 'SHA-256 Hash', pro: 'SHA-256 Hash', enterprise: 'SHA-256 + IP Whitelisting' },
      { name: 'Single Sign-On (SSO / SAML)', free: false, pro: false, enterprise: '✓ (Okta, Azure, OAuth)' },
    ],
  },
  {
    category: 'Telemetry, Debugging & Logs',
    icon: Activity,
    rows: [
      { name: 'Log Retention', free: '24 Hours', pro: '30 Days', enterprise: 'Custom Retention (Up to 1 Year)' },
      { name: 'cURL Re-run & Playground', free: 'Basic', pro: 'Advanced Diagnostics', enterprise: 'Dedicated Sandbox' },
      { name: 'Webhook Event Alerts', free: false, pro: '✓ (Low balance, failover)', enterprise: '✓ Real-time Webhooks & Sinks' },
    ],
  },
  {
    category: 'SLA & Support',
    icon: Server,
    rows: [
      { name: 'Uptime Guarantee', free: 'Best-effort', pro: '99.9% SLA', enterprise: '99.99% Custom SLA' },
      { name: 'Support Tier', free: 'Community Discord', pro: 'Priority Email & Discord', enterprise: 'Dedicated Slack Channel & 24/7 Phone' },
    ],
  },
];

export const PricingFeatureMatrix: React.FC = () => {
  const renderValue = (val: string | boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
          <Check className="w-4 h-4 text-emerald-500" /> Included
        </span>
      ) : (
        <span className="text-zinc-400 font-bold">
          <X className="w-4 h-4 text-zinc-400 inline" />
        </span>
      );
    }
    return <span className="font-semibold text-zinc-800 dark:text-zinc-200">{val}</span>;
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto selection:bg-lime-400 selection:text-zinc-950">
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Compare Plan Capabilities
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Detailed breakdown of routing throughput, security enforcement, telemetry, and support across tiers.
        </p>
      </div>

      {/* Comparison Table Card */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 shadow-sm dark:shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                <th className="p-4 sm:p-5 font-extrabold w-1/3">Features</th>
                <th className="p-4 sm:p-5 font-extrabold w-1/5 text-center">Developer Free</th>
                <th className="p-4 sm:p-5 font-extrabold w-1/5 text-center bg-lime-400/10 text-lime-600 dark:text-lime-400 border-x border-lime-400/20">
                  Pro Gateway
                </th>
                <th className="p-4 sm:p-5 font-extrabold w-1/5 text-center">Dedicated Enterprise</th>
              </tr>
            </thead>

            {/* Table Body by Categories */}
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {MATRIX_DATA.map((cat) => {
                const Icon = cat.icon;
                return (
                  <React.Fragment key={cat.category}>
                    {/* Category Header Row */}
                    <tr className="bg-zinc-50/80 dark:bg-zinc-950/60">
                      <td colSpan={4} className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px] border-y border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-lime-500" />
                          <span>{cat.category}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Category Feature Rows */}
                    {cat.rows.map((row) => (
                      <tr key={row.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="p-4 sm:p-4 font-bold text-zinc-900 dark:text-zinc-100">{row.name}</td>
                        <td className="p-4 sm:p-4 text-center">{renderValue(row.free)}</td>
                        <td className="p-4 sm:p-4 text-center bg-lime-400/5 dark:bg-lime-400/5 border-x border-zinc-200 dark:border-zinc-800">{renderValue(row.pro)}</td>
                        <td className="p-4 sm:p-4 text-center">{renderValue(row.enterprise)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};
