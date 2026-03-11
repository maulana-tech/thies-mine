#!/bin/bash

echo "🔧 Rebuilding Tailwind CSS..."
echo ""

# Step 1: Clear Next.js cache
echo "1️⃣  Clearing Next.js cache..."
rm -rf .next
echo "   ✅ Cache cleared"
echo ""

# Step 2: Clear node_modules cache
echo "2️⃣  Clearing node_modules cache..."
rm -rf node_modules/.cache
echo "   ✅ Cache cleared"
echo ""

# Step 3: Rebuild
echo "3️⃣  Building project..."
npm run build
echo "   ✅ Build complete"
echo ""

# Step 4: Start dev server
echo "4️⃣  Starting development server..."
echo "   🚀 Server starting on http://localhost:3000"
echo ""
npm run dev
