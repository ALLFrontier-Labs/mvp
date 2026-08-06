import React, { useState, useEffect } from 'react';
import { 
  Server, 
  DollarSign, 
  Zap, 
  Activity, 
  BarChart3, 
  AppWindow, 
  LineChart, 
  HelpCircle 
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'providers', label: 'Providers & Backends', icon: Server },
  { id: 'pricing', label: 'Effective Pricing', icon: DollarSign },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'uptime', label: 'Uptime & Health', icon: Activity },
  { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
  { id: 'apps', label: 'Top Apps', icon: AppWindow },
  { id: 'activity', label: 'Activity', icon: LineChart },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

export function ToolDetailLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<string>('providers');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.2 }
    );

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* Sticky Left Sidebar Navigation */}
      <aside className="w-64 shrink-0 hidden lg:block sticky top-20 self-start space-y-1">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-r-md text-sm transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-lime-500/10 text-lime-600 dark:text-lime-400 font-semibold border-l-2 border-lime-500 dark:border-lime-400 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/40 border-l-2 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-lime-600 dark:text-lime-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 space-y-12">
        {children}
      </main>
    </div>
  );
}
