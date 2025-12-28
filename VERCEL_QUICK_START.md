# 🚀 Vercel Deployment - Quick Start

## 30-Second Setup

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit: Debate Mate"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Click **"Deploy"**

**That's it!** Your app is live. Vercel auto-detects Vite and builds automatically.

---

## Add API Keys (Optional - Users Can Input in UI)

For production security, add environment variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add (optional):
   ```
   VITE_GROK_API_KEY=your_key_here
   VITE_CLAUDE_API_KEY=your_key_here
   ```

**Note:** Current implementation allows users to input API keys directly in the app UI for maximum flexibility.

---

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain
3. Update DNS records per Vercel's instructions

---

## Key Features Already Configured

✅ **Zero Backend** - Pure static frontend  
✅ **Auto-Scaling** - Vercel handles everything  
✅ **Instant Deployments** - Push to GitHub = Live  
✅ **Preview URLs** - Every PR gets a preview  
✅ **Analytics Ready** - Enable in dashboard  

---

## Troubleshooting

**Build fails?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Routes not working?**
- Vercel auto-handles client-side routing
- Check `vercel.json` is in root directory

**API calls failing?**
- Verify API keys are correct
- Check browser console for errors

---

## Next Steps

1. ✅ Deploy to Vercel
2. Test all features
3. Add custom domain
4. Share with users
5. Monitor analytics

See `DEPLOYMENT.md` for detailed information.

**Questions?** Check the full README.md
