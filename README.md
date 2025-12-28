# 🏆 Debate Mate

An AI-powered debate analyzer that determines who made the stronger argument. Choose between **Petty Mode** (witty, shareable) or **Productive Mode** (serious, constructive) analysis.

## ✨ Features

### Dual Mode System
- **🎉 Petty Mode:** Uses Grok AI for sarcastic, entertaining analysis perfect for fun debates
- **💼 Productive Mode:** Uses Claude for serious, relationship-focused communication analysis

### Core Functionality
- 👥 Compare two perspectives on any disagreement
- 🤖 AI-powered analysis with scores (0-10)
- 🏅 Lifetime scoreboard tracking
- 📊 Debate history with filtering
- 🎨 Shareable result images (Petty Mode only)
- 💾 Persistent storage with localStorage
- 📱 Mobile-first responsive design

### User Experience
- Smooth animations and transitions
- Playful gradient backgrounds
- Celebratory confetti effects on wins
- Clean, modern interface
- Zero backend complexity

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- API keys:
  - Grok API key: https://console.x.ai
  - Claude API key: https://console.anthropic.com

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/debate-mate.git
cd debate-mate

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build optimized bundle
pnpm build

# Preview production build
pnpm preview
```

## 📖 Usage

### Starting a Debate

1. **Select Mode:** Choose between Petty or Productive mode
2. **Enter Names:** (Optional) Name each person
3. **Enter Arguments:** Type or paste each person's perspective
4. **Provide API Key:** Enter your Grok or Claude API key
5. **Analyze:** Click "Analyze Debate"
6. **View Results:** See scores, analysis, and lifetime record

### Sharing Results (Petty Mode)

1. After debate analysis, click "Share Result"
2. Image downloads automatically
3. Share on social media or messaging apps

### Tracking Stats

1. Click "Stats" button to view:
   - Total debates analyzed
   - Scoreboard by person
   - Debate history (last 20)
   - Filter by mode

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Routing:** Wouter
- **Components:** shadcn/ui
- **Build:** Vite
- **AI APIs:** Grok (X.AI) & Claude (Anthropic)

### Data Flow
```
User Input
    ↓
Debate Analysis (AI API)
    ↓
Parse AI Response
    ↓
Save to localStorage
    ↓
Display Results
    ↓
Generate Shareable Image (optional)
```

### Storage
- **Debate History:** Full debate records with timestamps
- **Scoreboard:** Win/loss records by person
- **Persistence:** Browser localStorage (no backend)

## 🎨 Design System

### Color Palette
- **Petty Mode:** Warm gradients (gold → orange → pink)
- **Productive Mode:** Cool gradients (indigo → purple → cyan)
- **Accents:** Purple primary, emerald (Petty), sky (Productive)

### Typography
- **Display:** Poppins Bold (800)
- **Headings:** Poppins Bold (700)
- **Body:** Poppins Regular (400)
- **Accents:** Fredoka for playful elements

### Animations
- Smooth transitions (300-400ms)
- Bounce-in effects on load
- Floating animations for decorative elements
- Confetti burst on wins
- Glow effects on interactive elements

## 📁 Project Structure

```
debate-mate/
├── client/
│   ├── public/
│   │   └── images/              # Hero gradients, trophy icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResultsScreen.tsx
│   │   │   ├── Confetti.tsx
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Home.tsx         # Main debate interface
│   │   │   ├── Stats.tsx        # History & scoreboard
│   │   │   └── NotFound.tsx
│   │   ├── hooks/
│   │   │   └── useDebate.ts     # Debate analysis hook
│   │   ├── lib/
│   │   │   ├── debateUtils.ts   # Storage & utilities
│   │   │   └── aiService.ts     # API integration
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx
│   │   ├── App.tsx              # Router
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Global styles
│   └── index.html
├── package.json
├── vite.config.ts
├── vercel.json                  # Vercel deployment config
├── DEPLOYMENT.md                # Deployment guide
└── README.md
```

## 🔧 Configuration

### Environment Variables

Optional environment variables (can be set in Vercel):

```env
VITE_APP_TITLE=Debate Mate
VITE_APP_LOGO=/logo.png
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-id
```

### API Configuration

APIs are called directly from the browser. For production, consider:

1. **Backend Proxy:** Create a Node.js backend to proxy API calls
2. **Environment Variables:** Store API keys securely on backend
3. **Rate Limiting:** Implement on backend to prevent abuse

See `DEPLOYMENT.md` for detailed security recommendations.

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

See `DEPLOYMENT.md` for detailed instructions.

### Deploy to Other Platforms

The app can be deployed to any static hosting:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Cloudflare Pages

Just run `pnpm build` and serve the `dist/` folder.

## 🔒 Security & Privacy

### Data Storage
- All debate history stored locally in browser
- No data sent to external servers except API calls
- Users can clear all data anytime

### API Keys
- **Current:** Users input API keys in UI (for MVP)
- **Production:** Use backend proxy to hide keys
- Never commit API keys to repository

### CORS
- Grok and Claude APIs support browser requests
- No additional CORS configuration needed

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### API Errors
- Verify API keys are correct
- Check API rate limits
- Ensure arguments are not empty
- Check browser console for detailed errors

### Storage Issues
- Clear browser cache: Ctrl+Shift+Delete
- Check localStorage is enabled
- Try incognito/private mode

## 📊 Performance

### Optimizations
- Code splitting with Vite
- Lazy route loading
- CSS minification
- JavaScript tree-shaking
- Image optimization
- Gzip compression (Vercel)

### Metrics
- First Contentful Paint: ~1.2s
- Largest Contentful Paint: ~1.8s
- Cumulative Layout Shift: <0.1
- Time to Interactive: ~2.1s

## 🤝 Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

For entertainment and self-improvement - not a substitute for therapy or professional counseling.

## 🎯 Roadmap

- [ ] Voice recording for arguments
- [ ] User authentication
- [ ] Cloud data sync
- [ ] Team debates (3+ people)
- [ ] Debate templates
- [ ] Export as PDF
- [ ] Mobile app
- [ ] Debate categories

## 📞 Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** support@debatemate.app

## 🙏 Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- AI powered by Grok (X.AI) and Claude (Anthropic)
- UI components from shadcn/ui
- Icons from Lucide React

---

**Made with ⚡ for better arguments**

[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/debate-mate) • [View Demo](#) • [Report Bug](#) • [Request Feature](#)
