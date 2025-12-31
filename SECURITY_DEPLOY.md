# Security Hardening - Deployment Instructions

## ✅ Security Fixes Applied

1. ✅ **API Key Security**: Server-side validation with placeholder detection
   - Checks for `your-grok-api-key-here`, `your-claude-api-key-here`, or `placeholder`
   - Format validation (Grok: 20+ chars, Claude: `sk-ant-*`)
   - Prevents deployment with invalid keys
2. ✅ **Input Sanitization**: DOMPurify installed and applied to all user inputs
3. ✅ **CSP Headers**: Enhanced Content Security Policy in vercel.json
   - Added `object-src 'none'` to prevent plugin execution
   - Added `upgrade-insecure-requests` for HTTPS enforcement
4. ✅ **Rate Limiting**: Client-side rate limiting (5 requests/minute per browser)
5. ✅ **Input Validation**: 500 char max for arguments, 50 char max for names
6. ✅ **Error Handling**: No API keys or sensitive data leaked in error messages
7. ✅ **Response Validation**: API responses checked for sensitive data leaks

## 🚀 One-Line Deploy

```bash
git add . && git commit -m "Security hardening: CSP, input sanitization, rate limiting" && git push origin main
```

## 📋 Pre-Deployment Checklist

### 1. Environment Variables (Vercel Dashboard)
Set these in **Vercel → Settings → Environment Variables**:
- `GROK_API_KEY` (server-side only, no VITE_ prefix)
- `CLAUDE_API_KEY` (server-side only, no VITE_ prefix)

**Remove any old `VITE_*` prefixed variables** - they're no longer needed.

### 2. Vercel Security Settings
Enable in **Vercel Dashboard → Settings → Security**:
- ✅ DDoS Protection (automatic on Pro/Enterprise)
- ✅ Web Application Firewall (WAF) - enable if available
- ✅ Bot Management - enable if available

See: https://vercel.com/docs/security

### 3. Verify API Routes
After deployment, test:
- `/api/grok` (Petty mode)
- `/api/claude` (Productive mode)

Both should return JSON responses without exposing API keys.

## 🔒 Security Features

### Input Sanitization
- All user inputs sanitized with DOMPurify
- HTML tags stripped
- XSS prevention

### Rate Limiting
- 5 requests per minute per browser (localStorage-based)
- Automatic reset after 60 seconds
- Prevents abuse

### Content Security Policy
- Strict CSP headers prevent XSS
- Only allows connections to required APIs
- Blocks inline scripts (except necessary ones)

### Error Handling
- Generic error messages (no API key leaks)
- Server-side logging only
- Response validation prevents data leaks

## 📝 Notes

- Rate limiting is client-side (localStorage) - can be bypassed by clearing storage
- For production, consider server-side rate limiting via Vercel Edge Functions
- CSP may need adjustment if adding external services
- All API keys stored server-side only (never in client code)

