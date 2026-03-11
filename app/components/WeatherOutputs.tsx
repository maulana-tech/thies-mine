"use client";

import { useState, useEffect } from 'react';

interface WeatherOutput {
  filename: string;
  path: string;
  size_bytes: number;
  created_at: string;
  type: 'map' | 'dashboard' | 'report';
}

export default function WeatherOutputs() {
  const [outputs, setOutputs] = useState<WeatherOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchOutputs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/weather/outputs/list`);
      const result = await response.json();

      if (result.success) {
        setOutputs(result.files || []);
      } else {
        setError('Failed to fetch outputs');
      }
    } catch (err) {
      setError(String(err));
      console.error('Error fetching outputs:', err);
    }
    setLoading(false);
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_URL}/weather/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          include_map: true, 
          include_dashboard: true 
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Report generated successfully!\n\nFiles: ${result.files?.length || 0}`);
        await fetchOutputs();
      } else {
        alert(`❌ Error: ${result.message || result.detail}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setGenerating(false);
  };

  useEffect(() => {
    fetchOutputs();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'map': return '🗺️';
      case 'dashboard': return '📊';
      case 'report': return '📄';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'map': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'dashboard': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'report': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading weather outputs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-dark p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-semibold text-2xl">📊 Weather Reports</h3>
          <p className="text-gray-400 text-sm mt-1">
            Generated weather maps, dashboards, and reports
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchOutputs}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '⏳ Generating...' : '⚡ Generate New Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border-l-4 border-red-500 rounded">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-dark-bg rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Total Files</p>
          <p className="text-3xl font-bold text-white">{outputs.length}</p>
        </div>
        <div className="bg-dark-bg rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Maps</p>
          <p className="text-3xl font-bold text-blue-400">
            {outputs.filter(o => o.type === 'map').length}
          </p>
        </div>
        <div className="bg-dark-bg rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Dashboards</p>
          <p className="text-3xl font-bold text-purple-400">
            {outputs.filter(o => o.type === 'dashboard').length}
          </p>
        </div>
      </div>

      {/* Files List */}
      {outputs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h4 className="text-white font-semibold text-lg mb-2">No Reports Generated</h4>
          <p className="text-gray-400 mb-6">
            Click "Generate New Report" to create weather maps and dashboards
          </p>
          <button
            onClick={generateReport}
            disabled={generating}
            className="px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors disabled:opacity-50"
          >
            {generating ? '⏳ Generating...' : '⚡ Generate Your First Report'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {outputs.map((output, idx) => (
            <div
              key={idx}
              className={`bg-dark-bg rounded-lg p-4 border-l-4 ${
                output.type === 'map' ? 'border-blue-500' :
                output.type === 'dashboard' ? 'border-purple-500' :
                'border-green-500'
              } hover:bg-dark-bg/80 transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{getTypeIcon(output.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-white font-medium">{output.filename}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs border ${getTypeColor(output.type)}`}>
                        {output.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>📅 {formatDate(output.created_at)}</span>
                      <span>💾 {formatFileSize(output.size_bytes)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`${API_URL}/../data/weather_outputs/${output.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-accent-blue/20 text-accent-blue rounded hover:bg-accent-blue/30 transition-colors text-sm"
                  >
                    👁️ View
                  </a>
                  <a
                    href={`/api/weather-download?file=${encodeURIComponent(output.filename)}`}
                    download={output.filename}
                    className="px-4 py-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors text-sm"
                  >
                    ⬇️ Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <h4 className="text-blue-400 font-semibold mb-2">ℹ️ About Weather Reports</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• <strong>Maps:</strong> Interactive Leaflet maps with site location and weather data</li>
          <li>• <strong>Dashboards:</strong> Complete weather dashboard with charts and forecasts</li>
          <li>• <strong>Reports:</strong> PDF-ready reports with analysis and recommendations</li>
          <li>• Reports are auto-generated every hour and stored in <code className="text-blue-400">/data/weather_outputs/</code></li>
        </ul>
      </div>
    </div>
  );
}
