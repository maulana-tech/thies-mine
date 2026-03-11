"use client";

import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import SiteOverviewMap from './components/SiteOverviewMap';
import WeatherDashboard from './components/WeatherDashboard';
import WeatherOutputs from './components/WeatherOutputs';
import DocumentUpload from './components/DocumentUpload';
import RAGQuery from './components/RAGQuery';
import Analytics from './components/Analytics';
import ReportingDashboard from './components/ReportingDashboard';

export default function Home() {
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    documents: 3,
    riskLevel: 'LOW',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'overview';
      setActiveSection(tab);
    };

    // Set initial tab from URL
    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ragStats, weatherRisk] = await Promise.all([
          fetch(`${API_URL}/rag/stats`).then(r => r.json()),
          fetch(`${API_URL}/weather/risk`).then(r => r.json())
        ]);

        setStats({
          documents: ragStats.uploaded_documents || 0,
          riskLevel: weatherRisk.risk?.level || 'LOW',
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveSection(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-green-400',
      MEDIUM: 'text-amber-400',
      HIGH: 'text-red-400'
    };
    return colors[level] || colors.LOW;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-dark p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">Documents</p>
          <p className="text-2xl font-bold text-white">{stats.documents}</p>
        </div>
        <div className="card-dark p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">Risk Level</p>
          <p className={`text-2xl font-bold ${getRiskColor(stats.riskLevel)}`}>{stats.riskLevel}</p>
        </div>
        <div className="card-dark p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">System</p>
          <p className="text-2xl font-bold text-green-400">Healthy</p>
        </div>
        <div className="card-dark p-4 rounded-xl">
          <p className="text-gray-400 text-xs mb-1">API</p>
          <p className="text-2xl font-bold text-white">Running</p>
        </div>
      </div>

      {/* Navigation */}
      <Navigation activeTab={activeSection} onTabChange={handleTabChange} />

      {/* Content Sections */}
      <div className="space-y-6">
        {activeSection === 'overview' && <SiteOverviewMap />}
        {activeSection === 'weather' && <WeatherDashboard />}
        {activeSection === 'reports' && <WeatherOutputs />}
        {activeSection === 'documents' && <DocumentUpload />}
        {activeSection === 'rag' && <RAGQuery />}
        {activeSection === 'analytics' && <Analytics />}
        {activeSection === 'reporting' && <ReportingDashboard />}
      </div>
    </div>
  );
}
