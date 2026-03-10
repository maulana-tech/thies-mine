"use client";

import { useState } from 'react';
import WeatherDashboard from './components/WeatherDashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-accent-blue/10 rounded-lg group-hover:bg-accent-blue/20 transition-colors">
              <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">+12% vs last month</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">Documents Processed</p>
            <p className="text-3xl font-bold text-white">1,234</p>
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-accent-green/10 rounded-lg group-hover:bg-accent-green/20 transition-colors">
              <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-accent-green">All Clear</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">Active Alerts</p>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-accent-purple/10 rounded-lg group-hover:bg-accent-purple/20 transition-colors">
              <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Avg 1.8s</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">RAG Queries Today</p>
            <p className="text-3xl font-bold text-white">847</p>
          </div>
        </div>

        <div className="metric-card group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-accent-green/10 rounded-lg group-hover:bg-accent-green/20 transition-colors glow-green">
              <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="status-badge status-low">LOW</span>
          </div>
          <div className="space-y-1">
            <p className="text-gray-400 text-sm">Risk Level</p>
            <p className="text-3xl font-bold text-accent-green">20/100</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card-dark p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'weather', label: 'Weather', icon: '🌤️' },
            { id: 'documents', label: 'Documents', icon: '📄' },
            { id: 'rag', label: 'RAG Query', icon: '🔍' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-dark-hover text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Operations */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card-dark p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Today's Operations</h3>
                  <button className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                        <span className="text-xl">⚡</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Safety Inspection</p>
                        <p className="text-gray-400 text-sm">Sector A-12</p>
                      </div>
                    </div>
                    <span className="status-badge bg-accent-blue/20 text-accent-blue border-accent-blue/30">In Progress</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-green/10 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📋</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Shift Briefing</p>
                        <p className="text-gray-400 text-sm">Morning Crew</p>
                      </div>
                    </div>
                    <span className="status-badge status-low">Completed</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent-purple/10 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔧</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Equipment Check</p>
                        <p className="text-gray-400 text-sm">Excavator #5</p>
                      </div>
                    </div>
                    <span className="status-badge bg-gray-500/20 text-gray-400 border-gray-500/30">Pending</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-dark-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Daily Progress</span>
                    <span className="text-white font-medium">66%</span>
                  </div>
                  <div className="progress-bar mt-2">
                    <div className="progress-fill" style={{ width: '66%' }}></div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card-dark p-6">
                <h3 className="text-white font-semibold text-lg mb-4">System Health</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                      <span className="text-gray-400 text-sm">API Status</span>
                    </div>
                    <span className="text-accent-green text-sm font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                      <span className="text-gray-400 text-sm">Database</span>
                    </div>
                    <span className="text-accent-green text-sm font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"></div>
                      <span className="text-gray-400 text-sm">Weather API</span>
                    </div>
                    <span className="text-accent-blue text-sm font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
                      <span className="text-gray-400 text-sm">Data Quality</span>
                    </div>
                    <span className="text-white text-sm font-medium">74.4%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - Map/Chart Placeholder */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card-dark p-6 h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-2">Site Overview Map</h3>
                  <p className="text-gray-400 mb-4">Interactive site map with real-time operations</p>
                  <button className="btn-primary">
                    View Full Map
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card-dark p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { time: '2 min ago', action: 'Document uploaded', user: 'John Smith', type: 'upload' },
                    { time: '15 min ago', action: 'Weather alert cleared', user: 'System', type: 'alert' },
                    { time: '1 hour ago', action: 'RAG query executed', user: 'Sarah Johnson', type: 'query' },
                    { time: '2 hours ago', action: 'Risk assessment updated', user: 'System', type: 'update' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:bg-dark-hover transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type === 'upload' ? 'bg-accent-blue/10' :
                          activity.type === 'alert' ? 'bg-accent-green/10' :
                          activity.type === 'query' ? 'bg-accent-purple/10' :
                          'bg-accent-orange/10'
                        }`}>
                          <span className="text-sm">
                            {activity.type === 'upload' ? '📤' :
                             activity.type === 'alert' ? '✅' :
                             activity.type === 'query' ? '🔍' : '📊'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{activity.action}</p>
                          <p className="text-gray-400 text-xs">{activity.user}</p>
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && <WeatherDashboard />}

        {activeTab === 'documents' && (
          <div className="card-dark p-8 text-center">
            <div className="w-20 h-20 bg-accent-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Document Upload</h3>
            <p className="text-gray-400 mb-6">Drag and drop files or click to browse</p>
            <button className="btn-primary">
              Select Files
            </button>
          </div>
        )}

        {activeTab === 'rag' && (
          <div className="card-dark p-6">
            <h3 className="text-white font-semibold text-lg mb-4">RAG Query System</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about procedures, regulations, or safety requirements..."
                  className="input-dark flex-1"
                />
                <button className="btn-primary">
                  Search
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  "Safety requirements for coal mines",
                  "Incident reporting procedure",
                  "Dust management requirements",
                ].map((example, idx) => (
                  <button key={idx} className="btn-secondary text-sm text-left">
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="card-dark p-8 text-center">
            <div className="w-20 h-20 bg-accent-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Analytics Dashboard</h3>
            <p className="text-gray-400">Advanced analytics and insights coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
