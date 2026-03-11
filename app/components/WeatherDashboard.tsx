"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for map components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

// Plotly for charts
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false }) as any;

interface WeatherData {
  current: any;
  alerts: any[];
  risk: any;
  forecast: any[];
  historical: any[];
  insights: string;
  site: {
    name: string;
    latitude: number;
    longitude: number;
  };
  data_quality: any;
}

export default function WeatherDashboard() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/weather/dashboard`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError('Failed to fetch weather data');
      }
    } catch (err) {
      setError(String(err));
      console.error('Error fetching weather data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWeatherData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-dark p-6 border-l-4 border-accent-red">
        <h3 className="text-white font-semibold mb-2">Error</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const { current, alerts, risk, forecast, historical, insights, site } = data;

  // Risk color mapping
  const riskColors: Record<string, string> = {
    LOW: 'text-green-600 bg-green-50 border-green-200',
    MEDIUM: 'text-orange-600 bg-orange-50 border-orange-200',
    HIGH: 'text-red-600 bg-red-50 border-red-200'
  };

  const riskColor = riskColors[risk?.level] || 'text-gray-600 bg-gray-50 border-gray-200';

  // Risk color mapping for dark theme
  const riskColorMap: Record<string, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-accent-green/10', text: 'text-accent-green', border: 'border-accent-green/30' },
    MEDIUM: { bg: 'bg-accent-orange/10', text: 'text-accent-orange', border: 'border-accent-orange/30' },
    HIGH: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/30' }
  };

  const riskColorClass = riskColorMap[risk?.level] || riskColorMap.LOW;

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Weather Intelligence</h2>
          <p className="text-gray-400">{site.name}</p>
        </div>
        <button 
          onClick={fetchWeatherData} 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, idx: number) => (
            <div 
              key={idx} 
              className={`card-dark p-4 border-l-4 ${
                alert.severity === 'CRITICAL' 
                  ? 'border-accent-red bg-accent-red/5' 
                  : 'border-accent-orange bg-accent-orange/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">
                  {alert.severity === 'CRITICAL' ? (
                    <svg className="w-5 h-5 text-accent-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{alert.type}</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    <strong>Value:</strong> {alert.value} | <strong>Threshold:</strong> {alert.threshold}
                  </p>
                  <p className="text-gray-400 text-sm">
                    <strong>Action:</strong> {alert.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-dark p-6">
          <p className="text-gray-400 text-sm mb-2">Temperature</p>
          <div className="text-3xl font-bold text-white">{current.temperature?.toFixed(1) || 0}°C</div>
          <p className="text-xs text-gray-500 mt-2">
            Feels like {current.feels_like?.toFixed(1) || 0}°C
          </p>
        </div>

        <div className="card-dark p-6">
          <p className="text-gray-400 text-sm mb-2">Wind Speed</p>
          <div className="text-3xl font-bold text-white">{current.wind_speed?.toFixed(1) || 0}</div>
          <p className="text-xs text-gray-500 mt-2">km/h</p>
        </div>

        <div className="card-dark p-6">
          <p className="text-gray-400 text-sm mb-2">Humidity</p>
          <div className="text-3xl font-bold text-white">{current.humidity || 0}%</div>
          <p className="text-xs text-gray-500 mt-2">Relative humidity</p>
        </div>

        <div className={`card-dark p-6 border-2 ${riskColorClass.border} ${riskColorClass.bg}`}>
          <p className={`text-sm mb-2 ${riskColorClass.text}`}>Risk Level</p>
          <div className={`text-3xl font-bold ${riskColorClass.text}`}>{risk?.level || 'UNKNOWN'}</div>
          <p className={`text-xs mt-2 ${riskColorClass.text}`}>{risk?.score?.toFixed(0) || 0}/100</p>
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="card-dark p-6">
          <h3 className="text-white font-semibold text-lg mb-4">AI Insights</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{insights}</p>
        </div>
      )}

      {/* Map and Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Map */}
        <div className="card-dark p-6">
          <h3 className="text-white font-semibold text-lg mb-2">Site Location</h3>
          <p className="text-gray-400 text-sm mb-4">
            {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
          </p>
          <div>
            <div className="h-80 rounded-lg overflow-hidden">
              {typeof window !== 'undefined' && (
                <MapContainer
                  center={[site.latitude, site.longitude]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[site.latitude, site.longitude]}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{site.name}</strong><br />
                        Temp: {current.temperature?.toFixed(1)}°C<br />
                        Wind: {current.wind_speed?.toFixed(1)} km/h<br />
                        Humidity: {current.humidity}%
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[site.latitude, site.longitude]}
                    radius={5000}
                    pathOptions={{ color: risk?.color || 'blue', fillOpacity: 0.1 }}
                  />
                </MapContainer>
              )}
            </div>
          </div>
        </div>

        {/* Temperature Trend Chart */}
        <div className="card-dark p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Temperature Trend (30 Days)</h3>
          <div>
            <div className="h-80">
              {typeof window !== 'undefined' && historical && historical.length > 0 && (
                <Plot
                  data={[
                    {
                      x: historical.map((d: any) => d.date),
                      y: historical.map((d: any) => d.temperature_max),
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Max Temp',
                      line: { color: '#ff6b6b', width: 2 },
                      marker: { size: 4 }
                    },
                    {
                      x: historical.map((d: any) => d.date),
                      y: historical.map((d: any) => d.temperature_min),
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Min Temp',
                      line: { color: '#4ecdc4', width: 2 },
                      marker: { size: 4 },
                      fill: 'tonexty',
                      fillcolor: 'rgba(78, 205, 196, 0.1)'
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 20, t: 20, b: 40 },
                    xaxis: { title: 'Date', color: '#9ca3af' },
                    yaxis: { title: 'Temperature (°C)', color: '#9ca3af' },
                    showlegend: true,
                    legend: { x: 0, y: 1 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { color: '#d1d5db' }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="card-dark p-6">
          <h3 className="text-white font-semibold text-lg mb-4">7-Day Forecast</h3>
          <div>
            <div className="h-80">
              {typeof window !== 'undefined' && forecast && forecast.length > 0 && (
                <Plot
                  data={[
                    {
                      x: forecast.map((d: any) => d.date),
                      y: forecast.map((d: any) => d.temperature),
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Forecast',
                      line: { color: '#a78bfa', width: 3, dash: 'dash' },
                      marker: { size: 8 }
                    },
                    {
                      x: forecast.map((d: any) => d.date),
                      y: forecast.map((d: any) => d.upper_bound),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Upper 95%',
                      line: { color: '#6b7280', width: 1, dash: 'dot' },
                      showlegend: false
                    },
                    {
                      x: forecast.map((d: any) => d.date),
                      y: forecast.map((d: any) => d.lower_bound),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Lower 95%',
                      line: { color: '#6b7280', width: 1, dash: 'dot' },
                      fill: 'tonexty',
                      fillcolor: 'rgba(107, 114, 128, 0.2)',
                      showlegend: false
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 20, t: 20, b: 40 },
                    xaxis: { title: 'Date', color: '#9ca3af' },
                    yaxis: { title: 'Temperature (°C)', color: '#9ca3af' },
                    showlegend: true,
                    legend: { x: 0, y: 1 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { color: '#d1d5db' }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Wind & Precipitation Chart */}
        <div className="card-dark p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Wind & Precipitation</h3>
          <div>
            <div className="h-80">
              {typeof window !== 'undefined' && historical && historical.length > 0 && (
                <Plot
                  data={[
                    {
                      x: historical.map((d: any) => d.date),
                      y: historical.map((d: any) => d.wind_speed),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Wind Speed',
                      yaxis: 'y',
                      line: { color: '#10b981', width: 2 }
                    },
                    {
                      x: historical.map((d: any) => d.date),
                      y: historical.map((d: any) => d.precipitation),
                      type: 'bar',
                      name: 'Precipitation',
                      yaxis: 'y2',
                      marker: { color: '#06b6d4' }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 40, t: 20, b: 40 },
                    xaxis: { title: 'Date', color: '#9ca3af' },
                    yaxis: { title: 'Wind Speed (km/h)', color: '#9ca3af' },
                    yaxis2: {
                      title: 'Precipitation (mm)',
                      overlaying: 'y',
                      side: 'right',
                      color: '#9ca3af'
                    },
                    showlegend: true,
                    legend: { x: 0, y: 1 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { color: '#d1d5db' }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality Info */}
      {data.data_quality && (
        <div className="card-dark p-6">
          <h3 className="text-white font-semibold text-sm mb-4">Data Quality</h3>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-gray-400">Overall: </span>
              <span className="text-white font-semibold">
                {(data.data_quality.overall * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">Last Updated: </span>
              <span className="text-white font-semibold">
                {new Date(current.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
