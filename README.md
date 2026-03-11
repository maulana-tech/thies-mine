# Thies Mining AI Platform - Dashboard

Modern dashboard frontend untuk Thies Mining AI Platform yang dibangun dengan Next.js 15, React, dan Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

**Dashboard URL**: http://localhost:3000

---

## ✨ Fitur Utama

### 1. 🗺️ Overview Dashboard
- Statistik real-time operasi mining
- Status sistem dan kesehatan API
- **Site Overview Map** - Interactive map dengan Lake Vermont coordinates
- Weather overlay dengan real-time data
- TARP alerts display

### 2. 🌤️ Weather Dashboard
- Monitoring cuaca real-time untuk lokasi mining
- Peta interaktif dengan Leaflet
- Alert cuaca otomatis (TARP)
- Grafik historis dan forecast (ARIMA)
- Analisis risiko berdasarkan kondisi cuaca
- Auto-refresh setiap 5 menit

### 3. 📊 Weather Reports (NEW!)
- View semua generated weather reports
- Download reports (HTML, PDF)
- Generate new reports on-demand
- File statistics dan management

### 4. 📤 Document Upload
- Upload dokumen PDF dan DOCX
- Proses otomatis dan indexing ke vector database
- Manajemen dokumen yang sudah diupload
- Tracking status upload dan processing

### 5. 💬 RAG Query System (ENHANCED!)
- **Chat-based interface** dengan session history
- Query AI terhadap dokumen yang sudah diupload
- Jawaban dengan sumber referensi
- Example queries dengan categories
- Export chat functionality
- Cache untuk faster responses

### 6. 📈 Analytics (FIXED!)
- Statistik penggunaan sistem
- Top queries leaderboard
- Performance metrics
- **Interactive charts** dengan Plotly.js
- Daily activity tracking

### 7. 📧 Reporting (FIXED!)
- Send reports via email (Gmail integration)
- Create Gmail drafts
- Generate reports dengan preview
- Better error handling

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Custom UI components + shadcn/ui
- **Maps**: React Leaflet (OpenStreetMap)
- **Charts**: Plotly.js
- **State Management**: React Hooks
- **API Client**: Fetch API

## Instalasi

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local dan sesuaikan NEXT_PUBLIC_API_URL

# Run development server
npm run dev
```

## Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Environment Variables**:
- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

### Option 2: Docker

```bash
# Build image
docker build -t thies-mining-dashboard .

# Run container
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  thies-mining-dashboard
```

### Option 3: Traditional Server

```bash
# Build
npm run build

# Run with PM2
pm2 start npm --name "thies-dashboard" -- start
```

**📖 Complete Deployment Guide**: See [DEPLOYMENT.md](../DEPLOYMENT.md)

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Struktur Folder

```
dashboard/
├── app/
│   ├── components/
│   │   ├── Navigation.tsx      # Top navigation bar
│   │   ├── WeatherDashboard.tsx # Weather monitoring
│   │   ├── DocumentUpload.tsx   # Document upload & management
│   │   ├── RAGQuery.tsx         # RAG query interface
│   │   └── Analytics.tsx        # Analytics dashboard
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page with tab routing
│   └── globals.css             # Global styles
├── components/
│   └── ui/                     # Reusable UI components
├── lib/
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## Navigasi

Dashboard menggunakan tab-based navigation dengan URL query parameters:

- `/?tab=overview` - Overview dashboard (default)
- `/?tab=weather` - Weather monitoring
- `/?tab=documents` - Document upload
- `/?tab=rag` - RAG query system
- `/?tab=analytics` - Analytics

## API Integration

Dashboard berkomunikasi dengan backend API di `http://localhost:8000`:

### Endpoints yang digunakan:

- `GET /weather/current` - Current weather data
- `POST /rag/upload` - Upload single document
- `POST /rag/upload-multiple` - Upload multiple documents
- `GET /rag/documents` - List uploaded documents
- `DELETE /rag/documents/{filename}` - Delete document
- `POST /rag/query` - Query RAG system

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

Dashboard dapat di-deploy ke berbagai platform:

- **Vercel** (recommended untuk Next.js)
- **Netlify**
- **Docker** (sudah include di docker-compose.yml)

## Troubleshooting

### Error: Event handlers cannot be passed to Client Component props

Pastikan semua komponen yang menggunakan event handlers (onClick, onChange, dll) memiliki `"use client"` directive di bagian atas file.

### Map tidak muncul

Pastikan Leaflet CSS sudah di-load. Check di `layout.tsx` atau `globals.css`.

### API connection error

1. Pastikan backend API sudah running di `http://localhost:8000`
2. Check environment variable `NEXT_PUBLIC_API_URL`
3. Check CORS settings di backend

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Proprietary - Thies Mining
