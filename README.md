# Thies Mining AI Platform - Dashboard

Dashboard frontend untuk Thies Mining AI Platform yang dibangun dengan Next.js 15, React, dan Tailwind CSS.

## Fitur Utama

### 1. Overview Dashboard
- Statistik real-time operasi mining
- Status sistem dan kesehatan API
- Aktivitas terbaru
- Progress operasi harian
- Map site overview (placeholder untuk integrasi map interaktif)

### 2. Weather Dashboard
- Monitoring cuaca real-time untuk lokasi mining
- Peta interaktif dengan Leaflet
- Alert cuaca otomatis
- Grafik historis dan forecast
- Analisis risiko berdasarkan kondisi cuaca

### 3. Document Upload
- Upload dokumen PDF dan DOCX
- Proses otomatis dan indexing ke vector database
- Manajemen dokumen yang sudah diupload
- Tracking status upload dan processing

### 4. RAG Query System
- Query AI terhadap dokumen yang sudah diupload
- Jawaban dengan sumber referensi
- Example queries untuk memudahkan penggunaan
- Response time tracking

### 5. Analytics
- Statistik penggunaan sistem
- Top queries
- Performance metrics
- Visualisasi data (coming soon)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Custom UI components + shadcn/ui
- **Maps**: React Leaflet
- **Charts**: Plotly.js
- **State Management**: React Hooks

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
