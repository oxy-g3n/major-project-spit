# Quick Setup Guide

## ✅ All Tasks Completed!

Your IoT Sensor Dashboard is now ready. Here's what was built:

### 📁 Project Structure Created
```
frontend/
├── 3 pages (Dashboard, Heatmap, Chatbot)
├── API routes for data processing
├── Reusable UI components with shadcn/ui
├── Type-safe TypeScript throughout
└── Responsive, modern design
```

### 🎯 Features Implemented

#### 1. **Dashboard Page** (/)
- Real-time sensor statistics cards
- Time-series charts for all metrics (temperature, humidity, pressure, heat index)
- Auto-refresh every 5 minutes
- Device comparison across all 3 sensors

#### 2. **Heatmap Page** (/heatmap)
- Interactive Leaflet map
- IDW temperature interpolation
- Time slider to explore different timestamps
- Color-coded visualization (blue → red)
- Sensor markers with popup data

#### 3. **Chatbot Page** (/chatbot)
- AI-powered sensor analysis
- Context-aware responses
- Real-time chat interface
- Sidebar with data summary

### 🚀 Getting Started

1. **Add your Groq API key**
   Edit `.env.local` and replace:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
   Get a free API key at: https://console.groq.com

2. **Start the development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   Navigate to: http://localhost:3000

### 📋 What to Check

- ✅ Dashboard shows sensor data and charts
- ✅ Heatmap displays map with temperature overlay
- ✅ Time slider works and updates heatmap
- ✅ Chatbot responds to questions (needs Groq API key)
- ✅ Navigation between pages works
- ✅ Auto-refresh happens every 5 minutes

### 🔧 Key Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS v4** - Modern styling
- **shadcn/ui** - Beautiful UI components
- **SWR** - Data fetching and caching
- **Recharts** - Time-series visualizations
- **Leaflet** - Interactive maps
- **Groq AI** - LLM for chatbot (Llama 3.3 70B)

### 📊 Data Flow

1. **Firebase Realtime Database** → Raw sensor data
2. **API Route** (`/api/sensors`) → Processes and filters data
3. **SWR** → Caches and auto-refreshes
4. **UI Components** → Visualize data

### 🎨 Pages Overview

**Dashboard (Home)**
- Header with refresh button
- 4 stat cards (temp, humidity, pressure, heat index)
- 4 time-series charts comparing devices
- Responsive grid layout

**Heatmap**
- Full-screen map view
- Time slider control
- Temperature legend
- Sensor location markers
- IDW interpolation overlay

**Chatbot**
- Left sidebar: Data summary
- Main area: Chat interface
- AI responses with sensor context
- Message history

### ⚙️ Configuration

All sensor coordinates, API URLs, and constants are in:
- `lib/constants.ts` - Change sensor locations here
- `lib/dataProcessing.ts` - Modify data processing logic
- `lib/idwInterpolation.ts` - Adjust heatmap algorithm

### 🐛 Troubleshooting

**No data showing?**
- Check Firebase URL in `.env.local`
- Verify `/NEW_BOARDS` path exists in Firebase

**Chatbot not working?**
- Add your `GROQ_API_KEY` in `.env.local`
- Restart the dev server after adding the key

**Map not displaying?**
- Leaflet CSS is imported in `layout.tsx`
- Map uses dynamic import with `ssr: false`

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors in the terminal

### 📦 Production Build

When ready to deploy:
```bash
npm run build
npm start
```

Or deploy to Vercel:
1. Push code to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### 🎉 You're All Set!

Your IoT sensor dashboard is fully functional and ready for use. All three pages are working, data processing matches the Python implementation, and the UI is polished with shadcn/ui components.

**Next Steps:**
- Add your Groq API key to enable the chatbot
- Customize colors/styling in `lib/constants.ts`
- Add more features like CSV upload or prediction panel
- Deploy to Vercel for production use

Enjoy your new IoT dashboard! 🚀
