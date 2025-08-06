# Vercel Deployment Guide

This project includes a lightweight serverless function for generating embedding visualizations that works with Vercel's free tier.

## Local Development

1. **Start the development API server:**
   ```bash
   npm run dev:api
   ```

2. **Start the frontend in a separate terminal:**
   ```bash
   npm run dev
   ```

3. **Or start both together:**
   ```bash
   npm run dev:full
   ```

## Vercel Deployment

### Prerequisites
- Install Vercel CLI: `npm install -g vercel`
- Have a Vercel account (free)

### Deploy Steps

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy the project:**
   ```bash
   vercel
   ```
   
   Follow the prompts to:
   - Link to your Vercel account
   - Set up the project name
   - Configure build settings (Vercel will auto-detect Vite)

3. **The serverless function is automatically deployed:**
   - Location: `/api/visualize.js`
   - Endpoint: `https://your-project.vercel.app/api/visualize`

### Configuration

The project includes:
- `vercel.json`: Vercel configuration with CORS headers and function settings
- `/api/visualize.js`: Serverless function for embedding visualization
- Frontend automatically uses production API endpoint when deployed

### Free Tier Considerations

This implementation is designed for Vercel's free tier:
- ✅ No heavy ML libraries (scikit-learn, tensorflow, etc.)
- ✅ Lightweight SVG generation instead of matplotlib
- ✅ Fast cold start times
- ✅ Small bundle size
- ✅ Simple clustering algorithms
- ✅ No external dependencies beyond Node.js builtins

### Features

- **SVG-based visualization** - Lightweight and scalable
- **Simple clustering** - Rule-based clustering without ML dependencies  
- **Interactive visualization** - Shows relationships between Lean formalizations
- **Fast response times** - Optimized for serverless environment

### API Usage

```bash
curl -X POST https://your-project.vercel.app/api/visualize \
  -H "Content-Type: application/json" \
  -d '{
    "informal_statement": "The sum of two even numbers is even",
    "lean_codes": [
      "theorem sum_even : ∀ a b : ℕ, Even a → Even b → Even (a + b) := by sorry",
      "lemma sum_even_alt : ∀ x y : ℕ, Even x → Even y → Even (x + y) := by simp"
    ]
  }'
```

Returns:
```json
{
  "plot": "base64_encoded_svg",
  "format": "svg", 
  "message": "Generated visualization for 2 formalizations"
}
```
