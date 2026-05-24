# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Method 1: One-Click Deploy (Easiest)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: PhilHealth Checklist"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/philhealth-checklist.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - **Vercel will auto-detect everything!** ✨
   - Click "Deploy"
   - Done! Your app will be live in ~2 minutes

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
vercel

# For production
vercel --prod
```

---

## Deploy to Other Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Or via Netlify Dashboard:**
1. Drag the `dist` folder after running `pnpm build`
2. Or connect your GitHub repo

### GitHub Pages

```bash
# Install gh-pages
pnpm add -D gh-pages

# Add to package.json scripts:
"deploy": "pnpm build && gh-pages -d dist"

# Deploy
pnpm run deploy
```

### Railway

1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Railway auto-detects Vite projects
4. Deploy!

### Render

1. Go to [render.com](https://render.com)
2. "New Static Site"
3. Connect repository
4. Build command: `pnpm install && pnpm build`
5. Publish directory: `dist`

---

## Environment Variables (If Needed Later)

If you add API keys or environment variables:

1. **Create `.env` file locally:**
   ```bash
   VITE_API_KEY=your_key_here
   ```

2. **Add to Vercel:**
   - Dashboard → Settings → Environment Variables
   - Add your variables
   - Redeploy

3. **Use in code:**
   ```typescript
   const apiKey = import.meta.env.VITE_API_KEY;
   ```

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist pnpm-lock.yaml
pnpm install
pnpm build
```

### Vercel Deployment Issues

- Check build logs in Vercel dashboard
- Ensure `vercel.json` uses `pnpm` (already configured)
- Verify Node.js version (18+ required)

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
pnpm dev -- --port 3000
```

---

## Post-Deployment Checklist

✅ App loads correctly  
✅ Dark mode toggle works  
✅ All filters function properly  
✅ Table and card views switch  
✅ Modal opens/closes  
✅ Responsive on mobile  
✅ No console errors  

---

## Custom Domain (Optional)

### On Vercel:
1. Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records (Vercel provides instructions)

### On Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Configure DNS

---

## Performance Optimization

Current build is already optimized! But for future improvements:

- ✅ Code splitting (Vite does this automatically)
- ✅ CSS minification (enabled)
- ✅ Tree shaking (enabled)
- ✅ Gzip compression (Vercel/Netlify handle this)

**Build Size:**
- CSS: ~16.65 KB (gzipped)
- JS: ~51.32 KB (gzipped)
- Total: < 70 KB - Excellent! 🎉

---

## Monitoring & Analytics (Optional)

Add analytics to track usage:

```typescript
// Install Vercel Analytics
pnpm add @vercel/analytics

// In src/main.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

---

**Need help?** Check the main README.md or contact your team!
