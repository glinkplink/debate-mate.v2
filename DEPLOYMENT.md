# Debate Mate - Vercel Deployment Guide

## Overview

Debate Mate is a static frontend application built with React, TypeScript, and Tailwind CSS. It's optimized for seamless deployment on Vercel with zero backend complexity.

## Prerequisites

- Vercel account (free tier supported)
- GitHub account (for repository connection)
- Grok API key (for Petty Mode) - [Get it here](https://console.x.ai)
- Claude API key (for Productive Mode) - [Get it here](https://console.anthropic.com)

## Deployment Steps

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Debate Mate application"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/debate-mate.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd debate-mate
vercel
```

Follow the prompts to:
- Connect your GitHub account
- Select your GitHub repository
- Accept default settings (Vercel will auto-detect Vite configuration)

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Click "Deploy"

### 3. Configure Environment Variables

**Important:** API keys should NOT be hardcoded. Add them as environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables (these are optional - users can provide them in the UI):

```
VITE_GROK_API_KEY=your_grok_api_key
VITE_CLAUDE_API_KEY=your_claude_api_key
```

**Note:** The current implementation allows users to input API keys directly in the UI for maximum flexibility. For production, consider:
- Using a backend proxy to hide API keys
- Implementing server-side API forwarding
- Using Vercel Edge Functions for secure API calls

### 4. Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records according to Vercel's instructions

## Architecture

### Frontend Stack
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4
- **Routing:** Wouter (lightweight client-side router)
- **UI Components:** shadcn/ui
- **Build Tool:** Vite

### Key Features
- ✅ Pure static frontend (no backend required)
- ✅ Client-side routing with Wouter
- ✅ localStorage for data persistence
- ✅ Direct API calls to Grok and Claude
- ✅ Responsive mobile-first design
- ✅ Zero cold-start issues

### File Structure
```
debate-mate/
├── client/
│   ├── public/
│   │   └── images/          # Hero gradients and trophy icons
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components (Home, Stats)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── App.tsx          # Router configuration
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles & animations
│   └── index.html           # HTML template
├── package.json             # Dependencies
├── vercel.json              # Vercel configuration
└── vite.config.ts           # Vite build configuration
```

## Build & Deployment Details

### Build Command
```bash
pnpm build
```

Produces optimized output in `dist/` directory:
- HTML files with hashed assets
- Minified JavaScript and CSS
- Optimized images

### Output Directory
- Vercel automatically serves from `dist/` (configured in `vercel.json`)

### Environment Variables
The app uses these built-in environment variables (automatically injected by Vercel):
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo URL
- `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint (optional)
- `VITE_ANALYTICS_WEBSITE_ID` - Analytics ID (optional)

## Performance Optimizations

### Already Implemented
- ✅ Code splitting with Vite
- ✅ Lazy loading of routes
- ✅ Optimized images (gradient backgrounds)
- ✅ CSS minification with Tailwind
- ✅ JavaScript tree-shaking
- ✅ Gzip compression (automatic on Vercel)

### Additional Recommendations
- Enable Vercel Analytics for performance monitoring
- Use Vercel's Image Optimization for user-uploaded content
- Consider Vercel Edge Functions for API proxying

## Security Considerations

### API Keys
**Current Implementation:** Users input API keys directly in the UI
- ✅ Pros: No backend required, maximum privacy
- ⚠️ Cons: Keys visible in browser, not suitable for production

**For Production:**
1. **Backend Proxy Approach:**
   - Create a simple Node.js backend on Vercel Functions
   - Accept debate requests from frontend
   - Call Grok/Claude APIs from backend with stored keys
   - Return results to frontend

2. **Environment Variables:**
   - Store API keys in Vercel environment variables
   - Backend reads from env and proxies requests

3. **Rate Limiting:**
   - Implement rate limiting on backend
   - Protect against abuse

### Data Privacy
- All debate history stored in browser localStorage
- No data sent to external servers (except API calls to Grok/Claude)
- Users can clear data anytime via "Reset All Data" button

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### 404 Errors on Routes
- Vercel automatically handles client-side routing
- If issues persist, check `vercel.json` configuration
- Ensure `outputDirectory` is set to `dist`

### API Calls Failing
- Verify API keys are correct
- Check CORS headers (Grok and Claude APIs should allow browser requests)
- Use browser DevTools Network tab to inspect requests

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Verify Tailwind CSS is properly imported in `index.css`
- Check that custom fonts are loading from Google Fonts

## Monitoring & Analytics

### Vercel Analytics
1. Enable in Vercel dashboard: **Settings** → **Analytics**
2. View performance metrics and user insights

### Error Tracking
- Vercel automatically captures build and deployment errors
- Check **Deployments** tab for detailed logs

## Scaling & Limits

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ Unlimited bandwidth
- ✅ Automatic scaling
- ⚠️ 12 serverless function invocations/day (if using Functions)

### For High Traffic
- Upgrade to Vercel Pro ($20/month)
- Implement caching strategies
- Consider CDN optimization

## Continuous Deployment

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback to previous deployments anytime

### Manual Deployment
```bash
vercel --prod
```

## Updating the Application

### Deploy Updates
```bash
git add .
git commit -m "Update: [description]"
git push origin main
# Vercel automatically deploys
```

### Rollback to Previous Version
1. Go to Vercel dashboard
2. Click **Deployments**
3. Find previous deployment
4. Click **Promote to Production**

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add custom domain
3. ✅ Configure API keys
4. ✅ Test all features
5. ✅ Enable analytics
6. ✅ Share with users

## License

MIT License - Feel free to use and modify

---

**Happy debating! 🎉**
