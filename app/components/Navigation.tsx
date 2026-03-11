"use client";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const navigationItems = [
  { id: 'overview', label: '🗺️ Overview', icon: 'overview' },
  { id: 'weather', label: '🌤️ Weather', icon: 'weather' },
  { id: 'reports', label: '📊 Reports', icon: 'reports' },
  { id: 'documents', label: '📤 Documents', icon: 'documents' },
  { id: 'rag', label: '💬 RAG Query', icon: 'search' },
  { id: 'analytics', label: '📈 Analytics', icon: 'analytics' },
  { id: 'reporting', label: '📧 Reporting', icon: 'reporting' },
];

const IconComponent = ({ name }: { name: string }) => {
  const iconMap: Record<string, JSX.Element> = {
    overview: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    weather: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    documents: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    search: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    analytics: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    reporting: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    reports: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  return iconMap[name] || null;
};

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="card-dark p-1 rounded-xl">
      <div className="flex gap-1 overflow-x-auto">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-accent-blue/20 to-accent-blue/10 text-white shadow-lg border border-accent-blue/30'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover/50'
            }`}
          >
            <span className="text-lg">{item.label.split(' ')[0]}</span>
            <span className="hidden sm:inline">{item.label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
