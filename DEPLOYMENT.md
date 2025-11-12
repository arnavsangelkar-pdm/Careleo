# Careleo Healthcare CRM - Render Deployment Guide

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub repository: `https://github.com/arnavsangelkar-pdm/Careleo.git`
- Render account (free tier available)

### Deployment Steps

1. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"

2. **Configure Service**
   - **Build Command**: `pnpm install && pnpm run build` (or use `npm install && npm run build` if pnpm is not available)
   - **Start Command**: `pnpm start` (or `npm start`)
   - **Node Version**: 20.x (specified in package.json)
   - **Root Directory**: `/` (default)
   - **Note**: The project uses pnpm by default. If Render doesn't support pnpm, you can use npm commands instead.

3. **Environment Variables**
   - No environment variables required (all data is mocked)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Your app will be available at `https://your-app-name.onrender.com`

### 📊 Features Ready for Production

✅ **Customizable Analytics Dashboard (Phase 3)**
- Drag-and-drop widget system with 8 widget types
- Persona-based presets (Quality, Risk Adjustment, Member Services)
- Local storage persistence per persona
- Edit mode with add/remove/resize widgets
- Responsive grid layout

✅ **Unified Analytics Dashboard**
- 5 high-quality charts with real data
- URL-driven filtering system
- Responsive design

✅ **Complete CRM Functionality**
- 10,045 members with 3 outreach each (30,135 total outreach records)
- Member management, outreach tracking, cohorts, audit trail
- All data mocked and deterministic

✅ **Production Optimized**
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS styling
- Recharts for data visualization

### 🔧 Technical Details

- **Framework**: Next.js 14.0.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Deployment**: Static export ready
- **Data**: Fully mocked (no external dependencies)

### 📈 Analytics Charts

1. **Touches Over Time** - Line chart showing HRA vs all touches
2. **Touches by Team** - Pie chart showing team distribution
3. **Touches by Purpose** - Bar chart with HRA highlighting
4. **Channel Success Rate** - Bar chart showing completion rates
5. **Touches per Member** - Histogram showing distribution

All charts are interactive and filterable via URL parameters.

### 🎯 Demo Data

- **10,045 Members** with realistic healthcare data
- **30,135 Outreach Records** (3 per member)
- **200 Audit Records** for compliance tracking
- **Deterministic generation** for consistent demo experience

---

**Ready for deployment!** 🚀
