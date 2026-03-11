"use client";

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for Leaflet (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-dark-bg rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }
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
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

// Import Leaflet CSS
if (typeof window !== 'undefined') {
  import('leaflet/dist/leaflet.css').then(() => {});
}

interface SiteOperation {
  id: string;
  name: string;
  type: 'mining' | 'processing' | 'storage' | 'safety' | 'equipment';
  status: 'active' | 'inactive' | 'maintenance' | 'alert';
  latitude: number;
  longitude: number;
  details: {
    production?: string;
    workers?: number;
    equipment?: string[];
    risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
    temperature?: number;
    wind_speed?: number;
  };
}

interface WeatherCurrent {
  temperature: number;
  feels_like: number;
  wind_speed: number;
  humidity: number;
  visibility: number;
  weather_description: string;
  timestamp: string;
  source: string;
}

interface WeatherRisk {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  color: string;
  factors?: string[];
}

interface Alert {
  type: string;
  severity: string;
  value: string;
  threshold: string;
  action: string;
  tarp_plan: string;
  timestamp?: string;
}

interface SiteOverviewData {
  sites: SiteOperation[];
  weather_risk: WeatherRisk;
  current_weather: WeatherCurrent | null;
  total_operations: number;
  active_alerts: number;
  alerts: Alert[];
}

export default function SiteOverviewMap() {
  const [data, setData] = useState<SiteOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchSiteData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [weatherResponse, currentResponse, alertsResponse] = await Promise.all([
        fetch(`${API_URL}/weather/risk`).then(r => r.json()),
        fetch(`${API_URL}/weather/current`).then(r => r.json()),
        fetch(`${API_URL}/weather/alerts`).then(r => r.json())
      ]);

      // Safe weather risk handling
      const weatherRisk: WeatherRisk = (weatherResponse.success && weatherResponse.risk) 
        ? {
            level: weatherResponse.risk.level || 'LOW',
            score: weatherResponse.risk.score || 20,
            color: weatherResponse.risk.color || 'green',
            factors: weatherResponse.risk.factors || []
          }
        : { level: 'LOW', score: 20, color: 'green', factors: [] };

      // Safe current weather handling
      const currentWeather: WeatherCurrent | null = currentResponse.success 
        ? {
            temperature: currentResponse.data.temperature_max || currentResponse.data.temperature || 25,
            feels_like: currentResponse.data.feels_like || currentResponse.data.temperature_max || 25,
            wind_speed: currentResponse.data.wind_speed_max || currentResponse.data.wind_speed || 0,
            humidity: currentResponse.data.humidity || 65,
            visibility: currentResponse.data.visibility || 10000,
            weather_description: currentResponse.data.weather_description || 'Clear',
            timestamp: currentResponse.data.date || currentResponse.data.timestamp || new Date().toISOString(),
            source: currentResponse.data.source || 'CSV_HISTORICAL'
          }
        : null;

      const alerts: Alert[] = alertsResponse.success ? (alertsResponse.data || []) : [];

      // Lake Vermont Gold Mine coordinates
      const lakeVermontLat = -41.5;
      const lakeVermontLon = 146.5;
      const riskLevel = weatherRisk.level;

      const mockSites: SiteOperation[] = [
        {
          id: 'site-1',
          name: 'Lake Vermont Mine - Sector A',
          type: 'mining',
          status: 'active',
          latitude: lakeVermontLat + 0.01,
          longitude: lakeVermontLon + 0.01,
          details: {
            production: '12,450 tonnes/day',
            workers: 45,
            equipment: ['Excavator #1', 'Excavator #2', 'Dump Truck #5'],
            risk_level: riskLevel,
            temperature: currentWeather?.temperature,
            wind_speed: currentWeather?.wind_speed
          }
        },
        {
          id: 'site-2',
          name: 'Processing Plant',
          type: 'processing',
          status: 'active',
          latitude: lakeVermontLat - 0.005,
          longitude: lakeVermontLon + 0.015,
          details: {
            production: '8,200 tonnes/day',
            workers: 28,
            equipment: ['Crusher #1', 'Conveyor Belt A'],
            risk_level: riskLevel
          }
        },
        {
          id: 'site-3',
          name: 'Coal Storage Area',
          type: 'storage',
          status: 'active',
          latitude: lakeVermontLat - 0.008,
          longitude: lakeVermontLon + 0.005,
          details: {
            production: 'Stockpile: 45,000 tonnes',
            workers: 12,
            equipment: ['Stacker #1', 'Reclaimer #2'],
            risk_level: riskLevel
          }
        },
        {
          id: 'site-4',
          name: 'Safety Station A-12',
          type: 'safety',
          status: 'active',
          latitude: lakeVermontLat + 0.002,
          longitude: lakeVermontLon + 0.008,
          details: {
            workers: 8,
            equipment: ['First Aid', 'Emergency Equipment'],
            risk_level: riskLevel
          }
        },
        {
          id: 'site-5',
          name: 'Equipment Maintenance',
          type: 'equipment',
          status: currentWeather && currentWeather.temperature > 35 ? 'alert' : 'active',
          latitude: lakeVermontLat - 0.01,
          longitude: lakeVermontLon + 0.012,
          details: {
            workers: 15,
            equipment: ['Workshop Bay 1-4'],
            risk_level: riskLevel
          }
        }
      ];

      setData({
        sites: mockSites,
        weather_risk: weatherRisk,
        current_weather: currentWeather,
        total_operations: mockSites.filter(s => s.status === 'active').length,
        active_alerts: alerts.length,
        alerts: alerts
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Set minimal default data
      setData({
        sites: [{
          id: 'default',
          name: 'Lake Vermont Mine',
          type: 'mining',
          status: 'active',
          latitude: -41.5,
          longitude: 146.5,
          details: { risk_level: 'LOW' }
        }],
        weather_risk: { level: 'LOW', score: 20, color: 'green' },
        current_weather: null,
        total_operations: 1,
        active_alerts: 0,
        alerts: []
      });
    }
    setLoading(false);
    setMapReady(true);
  }, [API_URL]);

  const generateWeatherReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await fetch(`${API_URL}/weather/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ include_map: true, include_dashboard: true })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Report generated!\n\nFiles: ${result.files?.length || 0}`);
        await fetchSiteData();
      } else {
        alert(`❌ Error: ${result.message || result.detail}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setGeneratingReport(false);
  };

  useEffect(() => {
    fetchSiteData();
    const interval = setInterval(fetchSiteData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSiteData]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#22c55e',
      inactive: '#6b7280',
      maintenance: '#f59e0b',
      alert: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      mining: '⛏️',
      processing: '🏭',
      storage: '📦',
      safety: '🛡️',
      equipment: '🔧'
    };
    return icons[type] || '📍';
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      LOW: '#22c55e',
      MEDIUM: '#f59e0b',
      HIGH: '#ef4444'
    };
    return colors[level] || '#22c55e';
  };

  const getWeatherIcon = (description: string) => {
    const icons: Record<string, string> = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Thunderstorm: '⛈️',
      Snow: '❄️',
      Mist: '🌫️'
    };
    return icons[description] || '🌤️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading site map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-dark p-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-semibold text-2xl">🗺️ Site Overview Map</h3>
          <p className="text-gray-400 text-sm mt-1">Lake Vermont Gold Mine, Tasmania</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generateWeatherReport}
            disabled={generatingReport}
            className="px-4 py-2 bg-accent-purple/20 text-accent-purple rounded-lg hover:bg-accent-purple/30 transition-colors text-sm disabled:opacity-50"
          >
            {generatingReport ? '⏳ Generating...' : '📊 Generate Report'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Risk:</span>
            <span 
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                data?.weather_risk.level === 'HIGH' ? 'bg-red-500' :
                data?.weather_risk.level === 'MEDIUM' ? 'bg-amber-500' :
                'bg-green-500'
              } text-white`}
            >
              {data?.weather_risk.level || 'LOW'}
            </span>
          </div>
          <button 
            onClick={fetchSiteData}
            className="px-3 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors"
            title="Refresh data"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/30 border-l-4 border-red-500 rounded-lg">
          <p className="text-red-400 font-semibold">⚠️ Map Loading Issue</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchSiteData}
            className="mt-2 px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 text-sm"
          >
            🔄 Retry Loading Map
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl p-4 border border-green-700/30">
          <p className="text-green-400 text-xs mb-1">⚡ Active Operations</p>
          <p className="text-3xl font-bold text-white">{data?.total_operations || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-4 border border-blue-700/30">
          <p className="text-blue-400 text-xs mb-1">📍 Total Sites</p>
          <p className="text-3xl font-bold text-white">{data?.sites?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-xl p-4 border border-red-700/30">
          <p className="text-red-400 text-xs mb-1">🚨 Active Alerts</p>
          <p className="text-3xl font-bold text-white">{data?.active_alerts || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-xl p-4 border border-purple-700/30">
          <p className="text-purple-400 text-xs mb-1">🌡️ Temperature</p>
          <p className="text-3xl font-bold text-white">
            {data?.current_weather ? `${data.current_weather.temperature.toFixed(1)}°C` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Weather Banner */}
      {data?.current_weather && (
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 rounded-xl p-5 mb-6 border border-blue-600/30 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{getWeatherIcon(data.current_weather.weather_description)}</div>
              <div>
                <p className="text-white font-semibold text-lg">{data.current_weather.weather_description}</p>
                <p className="text-gray-300 text-sm mt-1">
                  <span className="mr-4">🤚 Feels like {data.current_weather.feels_like.toFixed(1)}°C</span>
                  <span className="mr-4">💨 Wind {data.current_weather.wind_speed.toFixed(1)} km/h</span>
                  <span>💧 Humidity {data.current_weather.humidity}%</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs mb-1">Last Updated</p>
              <p className="text-white font-semibold">
                {new Date(data.current_weather.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(data.current_weather.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span> Active Alerts ({data.alerts.length})
          </h4>
          <div className="space-y-2">
            {data.alerts.map((alert, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-900/30 border-red-500' :
                  alert.severity === 'WARNING' ? 'bg-amber-900/30 border-amber-500' :
                  'bg-blue-900/30 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg ${
                        alert.severity === 'CRITICAL' ? '🔴' :
                        alert.severity === 'WARNING' ? '🟡' : '🔵'
                      }`}></span>
                      <p className="text-white font-medium">{alert.type}</p>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Current: <span className="text-white font-medium">{alert.value}</span>
                      <span className="mx-2">•</span>
                      Threshold: <span className="text-gray-300">{alert.threshold}</span>
                    </p>
                    <p className="text-gray-300 text-xs mt-2 bg-white/5 px-3 py-2 rounded">
                      📋 {alert.action}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative h-[450px] rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl mb-6">
        {mapReady && data?.sites ? (
          <MapContainer
            center={[-41.5, 146.5]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
            scrollWheelZoom={true}
            onReady={() => setMapReady(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* 5km radius circle */}
            <Circle
              center={[-41.5, 146.5]}
              pathOptions={{ 
                color: getRiskColor(data.weather_risk?.level || 'LOW'), 
                fillColor: getRiskColor(data.weather_risk?.level || 'LOW'), 
                fillOpacity: 0.15,
                weight: 2
              }}
              radius={5000}
            />

            {/* Site markers */}
            {data.sites.map((site) => (
              <CircleMarker
                key={site.id}
                center={[site.latitude, site.longitude]}
                pathOptions={{
                  color: getStatusColor(site.status),
                  fillColor: getStatusColor(site.status),
                  fillOpacity: 0.8,
                  weight: 3
                }}
                radius={20}
                eventHandlers={{
                  click: () => setSelectedSite(site.id)
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <h4 className="font-bold text-gray-800 mb-3 text-lg">
                      {getTypeIcon(site.type)} {site.name}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(site.status) }}></span>
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium capitalize px-2 py-0.5 rounded bg-gray-100">{site.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{site.type}</span>
                      </div>
                      {site.details.production && (
                        <div className="bg-blue-50 p-2 rounded">
                          <span className="text-gray-600">📊 Production:</span>
                          <p className="font-medium text-blue-700">{site.details.production}</p>
                        </div>
                      )}
                      {site.details.workers && (
                        <div>
                          <span className="text-gray-600">👷 Workers:</span>
                          <span className="font-medium ml-2">{site.details.workers}</span>
                        </div>
                      )}
                      {site.details.equipment && site.details.equipment.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">🔧 Equipment:</p>
                          <p className="text-xs text-gray-700">{site.details.equipment.join(', ')}</p>
                        </div>
                      )}
                      {site.details.risk_level && (
                        <div className="mt-2">
                          <span 
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              site.details.risk_level === 'HIGH' ? 'bg-red-500' :
                              site.details.risk_level === 'MEDIUM' ? 'bg-amber-500' :
                              'bg-green-500'
                            } text-white`}
                          >
                            🎯 Risk: {site.details.risk_level}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-dark-bg">
            <div className="text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-gray-400">Map is loading...</p>
              <button 
                onClick={() => {
                  setMapReady(false);
                  setTimeout(() => setMapReady(true), 100);
                }}
                className="mt-4 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80"
              >
                Reload Map
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/98 rounded-lg p-4 shadow-2xl z-[1000] text-xs border border-gray-300">
          <p className="font-bold text-gray-800 mb-3 text-sm">📍 Site Legend</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-green-500 border-2 border-green-700"></span>
              <span className="text-gray-700">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-700"></span>
              <span className="text-gray-700">Inactive</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-700"></span>
              <span className="text-gray-700">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded-full bg-red-500 border-2 border-red-700"></span>
              <span className="text-gray-700">Alert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Site List */}
      <div>
        <h4 className="text-white font-semibold mb-3">📋 Site Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.sites && data.sites.map((site) => (
            <div 
              key={site.id}
              onClick={() => setSelectedSite(site.id)}
              className={`bg-dark-bg rounded-xl p-4 hover:bg-dark-bg/80 transition-all cursor-pointer border-2 ${
                selectedSite === site.id ? 'border-accent-blue' : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(site.type)}</span>
                  <div>
                    <p className="text-white font-medium">{site.name}</p>
                    <p className="text-gray-400 text-xs capitalize">{site.type}</p>
                  </div>
                </div>
                <span 
                  className="inline-block w-3 h-3 rounded-full shadow-lg"
                  style={{ backgroundColor: getStatusColor(site.status) }}
                  title={site.status}
                ></span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  site.status === 'active' ? 'bg-green-900/30 text-green-400' :
                  site.status === 'maintenance' ? 'bg-amber-900/30 text-amber-400' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {site.status.toUpperCase()}
                </span>
                {site.details.risk_level && (
                  <span className={`px-2 py-1 rounded-full ${
                    site.details.risk_level === 'HIGH' ? 'bg-red-900/30 text-red-400' :
                    site.details.risk_level === 'MEDIUM' ? 'bg-amber-900/30 text-amber-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    Risk: {site.details.risk_level}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
