# Weather Dashboard Integration

MineWeather AI telah diintegrasikan ke dalam Thies Mining Dashboard sebagai tab baru.

## Features

### 🌤️ Weather Tab
- **Current Conditions**: Temperature, wind speed, humidity, visibility
- **Risk Assessment**: Real-time risk scoring (LOW/MEDIUM/HIGH)
- **TARP Alerts**: Automatic threshold monitoring
- **Interactive Map**: Leaflet map dengan site location dan 5km radius
- **Temperature Trend**: 30-day historical chart
- **7-Day Forecast**: ARIMA-based prediction dengan confidence intervals
- **Wind & Precipitation**: Dual-axis chart
- **AI Insights**: Natural language weather analysis

## Setup

### 1. Start Backend API

```bash
# Terminal 1: Start FastAPI backend
source .venv/bin/activate
python run_api.py
```

API akan berjalan di http://localhost:8000

### 2. Start Dashboard

```bash
# Terminal 2: Start Next.js dashboard
cd dashboard
npm install  # First time only
npm run dev
```

Dashboard akan berjalan di http://localhost:3000

### 3. Access Weather Tab

1. Buka http://localhost:3000
2. Klik tab "🌤️ Weather"
3. Dashboard akan auto-load data dari API

## API Endpoints

### Weather Endpoints

```
GET /weather/dashboard      # Complete dashboard data
GET /weather/current        # Current conditions only
GET /weather/forecast       # 7-day forecast
GET /weather/alerts         # Active TARP alerts
GET /weather/risk           # Risk assessment
GET /weather/historical     # Historical data (30 days)
GET /weather/stats          # System statistics
```

### Example API Call

```bash
curl http://localhost:8000/weather/dashboard
```

## Components

### WeatherDashboard.tsx
Main weather dashboard component dengan:
- Auto-refresh setiap 5 menit
- Loading states
- Error handling
- Responsive grid layout

### Features:
1. **Current Conditions Cards**
   - Temperature (dengan feels like)
   - Wind Speed
   - Humidity
   - Risk Level (color-coded)

2. **AI Insights Card**
   - Natural language weather analysis
   - Actionable recommendations

3. **Interactive Map**
   - Leaflet/OpenStreetMap
   - Site marker dengan popup
   - 5km radius circle
   - Color-coded by risk level

4. **Charts (Plotly)**
   - Temperature trend (30 days)
   - 7-day forecast dengan confidence bands
   - Wind & precipitation dual-axis

5. **Data Quality Info**
   - Overall quality percentage
   - Last updated timestamp

## Configuration

### Environment Variables

Dashboard `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend `.env`:
```bash
OPENWEATHER_API_KEY=your_key_here
```

## Auto-Refresh

Dashboard auto-refresh setiap 5 menit. Manual refresh dengan tombol "🔄 Refresh".

## Responsive Design

- Desktop: 2-column grid untuk charts
- Mobile: Single column stack
- Tailwind CSS untuk styling

## Libraries Used

- **react-leaflet**: Interactive maps
- **plotly.js**: Interactive charts
- **axios**: API calls (optional, using fetch)
- **tailwindcss**: Styling

## Troubleshooting

### Map not showing
- Check browser console untuk errors
- Leaflet requires client-side rendering (using `dynamic` import)

### API connection failed
- Verify backend running di http://localhost:8000
- Check CORS settings
- Verify `NEXT_PUBLIC_API_URL` environment variable

### No data showing
- Check CSV files exist: `data/data-csv/lake_vermont_daily.csv`
- Verify weather agents initialized correctly
- Check API logs untuk errors

## Next Steps

1. **Real-time Updates**: WebSocket untuk live data
2. **Historical Playback**: Time-slider untuk historical data
3. **Alert Notifications**: Browser notifications untuk CRITICAL alerts
4. **Export Reports**: Download PDF/Excel reports
5. **COMPOSIO Integration**: Automated Google Docs/Sheets/Gmail reporting

## Production Deployment

### Backend
```bash
# Use production ASGI server
uvicorn api.main_simple:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
cd dashboard
npm run build
npm start
```

Or deploy to Vercel/Netlify dengan environment variables configured.
