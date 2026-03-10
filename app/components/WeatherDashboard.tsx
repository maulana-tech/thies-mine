"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">🌤️ MineWeather AI</h2>
          <p className="text-gray-600">{site.name}</p>
        </div>
        <Button onClick={fetchWeatherData} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, idx: number) => (
            <Alert key={idx} variant={alert.severity === 'CRITICAL' ? 'destructive' : 'default'}>
              <AlertTitle>
                {alert.severity === 'CRITICAL' ? '🔴' : '🟡'} {alert.type}
              </AlertTitle>
              <AlertDescription>
                <strong>Value:</strong> {alert.value} | <strong>Threshold:</strong> {alert.threshold}
                <br />
                <strong>Action:</strong> {alert.action}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Current Conditions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{current.temperature?.toFixed(1) || 0}°C</div>
            <p className="text-xs text-gray-500 mt-1">
              Feels like {current.feels_like?.toFixed(1) || 0}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Wind Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{current.wind_speed?.toFixed(1) || 0}</div>
            <p className="text-xs text-gray-500 mt-1">km/h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Humidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{current.humidity || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">Relative humidity</p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${riskColor}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{risk?.level || 'UNKNOWN'}</div>
            <p className="text-xs mt-1">{risk?.score?.toFixed(0) || 0}/100</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>💡 AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Map and Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Map */}
        <Card>
          <CardHeader>
            <CardTitle>📍 Site Location</CardTitle>
            <CardDescription>
              {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Temperature Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Temperature Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
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
                      line: { color: 'red', width: 2 },
                      marker: { size: 4 }
                    },
                    {
                      x: historical.map((d: any) => d.date),
                      y: historical.map((d: any) => d.temperature_min),
                      type: 'scatter',
                      mode: 'lines+markers',
                      name: 'Min Temp',
                      line: { color: 'blue', width: 2 },
                      marker: { size: 4 },
                      fill: 'tonexty',
                      fillcolor: 'rgba(255,0,0,0.1)'
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 20, t: 20, b: 40 },
                    xaxis: { title: 'Date' },
                    yaxis: { title: 'Temperature (°C)' },
                    showlegend: true,
                    legend: { x: 0, y: 1 }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle>🔮 7-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
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
                      line: { color: 'purple', width: 3, dash: 'dash' },
                      marker: { size: 8 }
                    },
                    {
                      x: forecast.map((d: any) => d.date),
                      y: forecast.map((d: any) => d.upper_bound),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Upper 95%',
                      line: { color: 'gray', width: 1, dash: 'dot' },
                      showlegend: false
                    },
                    {
                      x: forecast.map((d: any) => d.date),
                      y: forecast.map((d: any) => d.lower_bound),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Lower 95%',
                      line: { color: 'gray', width: 1, dash: 'dot' },
                      fill: 'tonexty',
                      fillcolor: 'rgba(128,128,128,0.2)',
                      showlegend: false
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 20, t: 20, b: 40 },
                    xaxis: { title: 'Date' },
                    yaxis: { title: 'Temperature (°C)' },
                    showlegend: true,
                    legend: { x: 0, y: 1 }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wind & Precipitation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>💨 Wind & Precipitation</CardTitle>
          </CardHeader>
          <CardContent>
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
                      line: { color: 'green', width: 2 }
                    },
                    {
                      x: historical.map((d: any) => d.date),
                      y: historical.map((d: any) => d.precipitation),
                      type: 'bar',
                      name: 'Precipitation',
                      yaxis: 'y2',
                      marker: { color: 'lightblue' }
                    }
                  ]}
                  layout={{
                    autosize: true,
                    margin: { l: 40, r: 40, t: 20, b: 40 },
                    xaxis: { title: 'Date' },
                    yaxis: { title: 'Wind Speed (km/h)' },
                    yaxis2: {
                      title: 'Precipitation (mm)',
                      overlaying: 'y',
                      side: 'right'
                    },
                    showlegend: true,
                    legend: { x: 0, y: 1 }
                  }}
                  config={{ responsive: true }}
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Info */}
      {data.data_quality && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-600">Overall: </span>
                <span className="font-semibold">
                  {(data.data_quality.overall * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated: </span>
                <span className="font-semibold">
                  {new Date(current.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
