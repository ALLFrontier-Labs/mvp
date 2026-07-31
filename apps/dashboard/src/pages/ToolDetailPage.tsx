import React from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { ToolDetailLayout } from '../components/tools/ToolDetailLayout';
import { ToolHeroHeader } from '../components/tools/ToolHeroHeader';
import { ToolProvidersTable } from '../components/tools/ToolProvidersTable';
import { ToolMetricsSections } from '../components/tools/ToolMetricsSections';
import { ToolAuxSections } from '../components/tools/ToolAuxSections';
import { getToolBySlug } from '../lib/services/tool-service';
import { ArrowLeft } from 'lucide-react';

export const ToolDetailPage: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // Handle both /tools/:provider/:tool and wildcard /tools/*
  let slug = params.slug || '';
  if (!slug) {
    slug = location.pathname.replace(/^\/tools\//, '').replace(/^\/tool\//, '');
  }

  const tool = getToolBySlug(slug);

  if (!tool) {
    return (
      <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans px-6 py-20 text-center space-y-4">
        <div className="text-4xl font-extrabold text-white">Tool Not Found</div>
        <p className="text-zinc-400 text-sm max-w-md mx-auto font-mono">
          No tool engine found matching slug <code className="text-yellow-400 font-mono">{slug}</code>.
        </p>
        <div>
          <Link to="/providers" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tool Providers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black">
      <ToolDetailLayout>
        {/* Hero Header */}
        <ToolHeroHeader
          tool={tool}
          onOpenPlayground={() => navigate('/playground')}
          onOpenQuickStart={() => navigate('/docs/quickstart')}
          onCompare={() => navigate('/providers')}
        />

        {/* Providers & Backends Table */}
        <ToolProvidersTable endpoints={tool.endpoints} />

        {/* Effective Pricing & Performance Metrics */}
        <ToolMetricsSections tool={tool} />

        {/* Benchmarks, Top Apps, Activity & FAQ Accordion */}
        <ToolAuxSections tool={tool} />
      </ToolDetailLayout>
    </div>
  );
};

export default ToolDetailPage;
