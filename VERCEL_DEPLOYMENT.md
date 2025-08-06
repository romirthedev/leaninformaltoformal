# Vercel Deployment Guide

This project uses a **complete frontend-only approach** for generating embedding visualizations, making it perfect for Vercel's free tier.

## Local Development

Simply start the development server:
```bash
npm run dev
```

The visualization feature works entirely in the browser with no backend required.

## Vercel Deployment

### Prerequisites
- Install Vercel CLI: `npm install -g vercel` (optional)
- Have a Vercel account (free)

### Deploy Steps

1. **Via GitHub (Recommended):**
   - Connect your GitHub repository to Vercel
   - Automatic deployments on every push
   - No additional configuration needed

2. **Via CLI:**
   ```bash
   vercel login
   vercel
   ```

3. **Configuration:**
   - Vercel auto-detects Vite configuration
   - No serverless functions needed
   - Static site deployment

### Free Tier Benefits

This implementation is **optimized for Vercel's free tier**:
- ✅ **Zero backend dependencies** - Pure client-side application
- ✅ **No API calls** - Everything runs in the browser
- ✅ **Fast builds** - Lightweight with minimal dependencies
- ✅ **Instant loading** - No cold start times
- ✅ **No usage limits** - Frontend-only means no function execution limits
- ✅ **Always available** - No server downtime concerns

### Features

- **Frontend Visualization Engine** - Complete client-side SVG generation
- **Smart Clustering** - Rule-based analysis of Lean code patterns
- **Interactive UI** - Real-time visualization without server delays
- **Responsive Design** - Works on all devices
- **Zero Configuration** - Deploy and run immediately

### How It Works

1. **User Input**: Informal statement and generated Lean code
2. **Code Analysis**: Client-side parsing and pattern recognition
3. **Clustering**: Rule-based grouping (theorems, lemmas, definitions, etc.)
4. **Visualization**: SVG generation with positioning algorithms
5. **Display**: Interactive visualization with cluster information

### Technical Architecture

```
Browser → Frontend Logic → SVG Generation → Display
    ↓
No server calls, no APIs, no external dependencies
```

### Deployment URL

Once deployed, your app will be available at:
`https://your-project-name.vercel.app`

The visualization feature works immediately with no additional setup required.
