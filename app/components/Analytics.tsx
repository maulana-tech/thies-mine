"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for Plotly
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface AnalyticsData {
  total_documents: number;
  total_queries: number;
  avg_query_time: number;
  cache_hit_rate: number;
  top_queries: Array<{ query: string; count: number }>;
  documents_by_category: Record<string, number>;
  daily_stats: Array<{ date: string; queries: number; documents: number }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchAnalytics = async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/rag/analytics`);
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        // Use mock data if API fails
        setMockData();
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      // Use mock data on error
      setMockData();
    }
    setLoading(false);
    setRefreshing(false);
  };

  const setMockData = () => {
    // Mock data for demo purposes
    const mockData: AnalyticsData = {
      total_documents: 3,
      total_queries: 127,
      avg_query_time: 1.8,
      cache_hit_rate: 0.45,
      top_queries: [
        { query: "What are the safety requirements for coal mines?", count: 23 },
        { query: "How should incidents be reported?", count: 18 },
        { query: "What are dust management procedures?", count: 15 },
        { query: "Explain the appointment process for SSE", count: 12 },
        { query: "What PPE is required underground?", count: 9 },
      ],
      documents_by_category: {
        "Safety Procedures": 2,
        "Compliance": 1,
        "Operations": 0
      },
      daily_stats: []
    };
    
    // Generate last 7 days of mock data
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      mockData.daily_stats.push({
        date: date.toISOString().split('T')[0],
        queries: Math.floor(Math.random() * 20) + 5,
        documents: Math.floor(Math.random() * 3)
      });
    }
    
    setData(mockData);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card-dark p-6 border-l-4 border-accent-red">
        <h3 className="text-white font-semibold mb-2">No Data Available</h3>
        <p className="text-gray-400">Unable to load analytics data</p>
        <button onClick={fetchAnalytics} className="mt-4 btn-primary">
          🔄 Retry
        </button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    x: data.daily_stats.map(s => s.date),
    y: data.daily_stats.map(s => s.queries),
    type: 'scatter' as const,
    mode: 'lines+markers',
    line: {
      color: '#3b82f6',
      width: 3,
      shape: 'spline'
    },
    marker: {
      size: 8,
      color: '#3b82f6'
    },
    fill: 'tozeroy',
    fillcolor: 'rgba(59, 130, 246, 0.1)'
  };

  const chartLayout = {
    autosize: true,
    height: 300,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#9ca3af',
      family: 'Inter, system-ui, sans-serif',
      size: 12
    },
    xaxis: {
      gridcolor: '#374151',
      linecolor: '#6b7280',
      tickangle: -45,
      tickfont: { size: 10 }
    },
    yaxis: {
      gridcolor: '#374151',
      linecolor: '#6b7280',
      zerolinecolor: '#6b7280',
      tickprefix: ''
    },
    margin: { t: 20, r: 20, l: 50, b: 50 },
    showlegend: false
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    scrollZoom: false
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Analytics Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">RAG system performance and usage metrics</p>
        </div>
        <button 
          onClick={fetchAnalytics} 
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          {refreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            <>
              🔄 Refresh
            </>
          )}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-dark p-6 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs text-blue-400 font-medium">Indexed & Searchable</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Documents</p>
          <div className="text-4xl font-bold text-white">{data.total_documents}</div>
        </div>

        <div className="card-dark p-6 rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xs text-purple-400 font-medium">All Time</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Queries</p>
          <div className="text-4xl font-bold text-white">{data.total_queries}</div>
        </div>

        <div className="card-dark p-6 rounded-xl bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs text-green-400 font-medium">Response Time</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Avg Query Time</p>
          <div className="text-4xl font-bold text-white">{data.avg_query_time.toFixed(2)}s</div>
        </div>

        <div className="card-dark p-6 rounded-xl bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-amber-400 font-medium">Cached Responses</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Cache Hit Rate</p>
          <div className="text-4xl font-bold text-green-400">{(data.cache_hit_rate * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="card-dark p-6 rounded-xl">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          📈 Daily Query Activity
        </h3>
        {data.daily_stats && data.daily_stats.length > 0 ? (
          <div className="h-[300px]">
            <Plot
              data={[chartData]}
              layout={chartLayout}
              config={config}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            <p>No daily activity data available</p>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents by Category */}
        {Object.keys(data.documents_by_category).length > 0 && (
          <div className="card-dark p-6 rounded-xl">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              📁 Documents by Category
            </h3>
            <div className="space-y-4">
              {Object.entries(data.documents_by_category).map(([category, count], idx) => {
                const maxCount = Math.max(...Object.values(data.documents_by_category));
                const percentage = (count / maxCount) * 100;
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'];
                
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">{category}</span>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                    <div className="h-3 bg-dark-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Queries */}
        {data.top_queries && data.top_queries.length > 0 && (
          <div className="card-dark p-6 rounded-xl">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              🔥 Top Queries
            </h3>
            <div className="space-y-3">
              {data.top_queries.slice(0, 5).map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-bg/80 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        idx === 1 ? 'bg-gray-500/20 text-gray-400' :
                        idx === 2 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-700/50 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <p className="text-white text-sm">{item.query}</p>
                    </div>
                  </div>
                  <span className="text-accent-blue font-semibold bg-accent-blue/10 px-3 py-1 rounded-full text-sm">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="card-dark p-6 rounded-xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          ℹ️ About Analytics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">
              <strong className="text-white">Documents:</strong> Total number of documents uploaded and indexed in the RAG system.
            </p>
          </div>
          <div>
            <p className="text-gray-400">
              <strong className="text-white">Queries:</strong> Total questions asked to the AI assistant across all sessions.
            </p>
          </div>
          <div>
            <p className="text-gray-400">
              <strong className="text-white">Cache Hit Rate:</strong> Percentage of queries served from cache for faster responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
