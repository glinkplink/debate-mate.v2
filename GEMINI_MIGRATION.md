# Migration from Grok to Gemini 2.5 Flash

## ✅ Changes Completed

### API Handler
- **Deleted**: `api/grok.js`
- **Created**: `api/gemini.js` - New Gemini API handler for Petty Mode
- **Model**: Currently using `gemini-2.0-flash-exp` (update to `gemini-2.5-flash` when available)

### Client Updates
- **Updated**: `client/src/lib/aiService.js`
  - Changed endpoint from `/api/grok` to `/api/gemini` for Petty Mode

### Configuration
- **Updated**: `vercel.json`
  - CSP updated to allow `https://generativelanguage.googleapis.com`
  - Removed `https://api.x.ai` from CSP

### Environment Variables
- **Old**: `GROK_API_KEY`
- **New**: `GEMINI_API_KEY`
- **Format**: 20+ characters (no specific prefix required)
- **Get API Key**: https://aistudio.google.com/app/apikey

## 🔧 API Key Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to Vercel environment variables:
   ```
   GEMINI_API_KEY=your-actual-api-key-here
   ```

## 📝 Model Name

The code currently uses `gemini-2.0-flash-exp` as the model name. To use `gemini-2.5-flash` when it becomes available:

1. Open `api/gemini.js`
2. Find line ~117:
   ```javascript
   const modelName = "gemini-2.0-flash-exp";
   ```
3. Change to:
   ```javascript
   const modelName = "gemini-2.5-flash";
   ```

## 🧪 Testing

After deployment, test Petty Mode:
1. Enter two arguments
2. Select Petty Mode
3. Click "Analyze debate"
4. Verify the analysis is generated using Gemini

## 📚 API Differences

### Grok API (Old)
- Endpoint: `https://api.x.ai/v1/chat/completions`
- Auth: `Bearer ${apiKey}` header
- Model: `grok-2-1212`
- Response: `data.choices[0].message.content`

### Gemini API (New)
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Auth: API key as query parameter `?key=${apiKey}`
- Model: `gemini-2.0-flash-exp` (or `gemini-2.5-flash` when available)
- Response: `data.candidates[0].content.parts[0].text`

## 🔒 Security

- API key validation checks for placeholders
- Minimum length validation (20+ characters)
- No API keys exposed in error messages
- Secure error handling maintained

---

**Status**: ✅ Migration Complete
**Next Step**: Update model name to `gemini-2.5-flash` when available

