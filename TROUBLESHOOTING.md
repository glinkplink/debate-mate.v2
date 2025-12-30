# Troubleshooting "Service configuration error" in Petty Mode

## 🔍 Error: "Service configuration error"

This error occurs when the `GEMINI_API_KEY` environment variable is missing or invalid.

## ✅ Quick Fix Checklist

### 1. Check Environment Variable in Vercel

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Look for `GEMINI_API_KEY`
5. Verify:
   - ✅ Key exists
   - ✅ Value is NOT "your-gemini-api-key-here"
   - ✅ Value is NOT empty
   - ✅ Value is at least 20 characters long
   - ✅ Value does NOT contain the word "placeholder"

### 2. Get a Gemini API Key

If you don't have a key:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (it will be ~39 characters)
5. Add it to Vercel environment variables

### 3. Redeploy After Adding Key

**Important:** After adding/updating environment variables:

1. Go to **Vercel Dashboard** → **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or trigger a new deployment by pushing to your repo

Environment variables are only loaded during deployment, so you must redeploy!

### 4. Check Deployment Logs

1. Go to **Vercel Dashboard** → **Deployments**
2. Click on the latest deployment
3. Check the **"Functions"** tab
4. Look for `/api/gemini` function logs
5. Check for error messages about `GEMINI_API_KEY`

## 🐛 Common Issues

### Issue: Key exists but still getting error

**Possible causes:**
- Key was added but deployment wasn't triggered
- Key has extra spaces (trim it)
- Key is too short (< 20 chars)
- Key contains "placeholder" text

**Solution:**
1. Edit the environment variable in Vercel
2. Remove any extra spaces
3. Ensure it's a valid Gemini API key
4. Redeploy the application

### Issue: Works locally but not on Vercel

**Cause:** Environment variables are different between local and production

**Solution:**
1. Make sure `GEMINI_API_KEY` is set in Vercel (not just locally)
2. Check that you're using `process.env.GEMINI_API_KEY` (not `import.meta.env.VITE_GEMINI_API_KEY`)
3. Redeploy after adding the variable

### Issue: Key format validation failing

**Gemini API keys:**
- Are typically 39 characters long
- Don't have a specific prefix
- Look like: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

**Solution:**
- Get a fresh key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Ensure it's copied completely (no truncation)

## 🔧 Debug Steps

### Step 1: Verify Key in Vercel

```bash
# Check via Vercel CLI (if installed)
vercel env ls
```

Or check in Vercel Dashboard → Settings → Environment Variables

### Step 2: Check Function Logs

1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Open Functions tab
4. Click on `/api/gemini`
5. Check logs for:
   - "GEMINI_API_KEY check:" (shows if key exists)
   - "GEMINI_API_KEY environment variable is not set" (key missing)
   - "GEMINI_API_KEY appears to be invalid format" (key too short)

### Step 3: Test API Endpoint Directly

```bash
# Test the endpoint (replace with your Vercel URL)
curl -X POST https://your-app.vercel.app/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "person1Name": "Test",
    "person1Argument": "Test argument",
    "person2Name": "Test2",
    "person2Argument": "Test argument 2"
  }'
```

Expected response if key is missing:
```json
{
  "error": "Service configuration error",
  "hint": "GEMINI_API_KEY environment variable is missing or invalid..."
}
```

## 📝 Environment Variable Setup

### In Vercel Dashboard:

1. **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your actual Gemini API key
   - **Environment:** Select all (Production, Preview, Development)
4. Click **"Save"**
5. **Redeploy** your application

### For Local Development:

Create `.env.local` file (don't commit this!):

```bash
GEMINI_API_KEY=your-actual-key-here
```

## ✅ Verification

After setting up the key and redeploying:

1. Test Petty Mode in your app
2. Check browser console for errors
3. Check Vercel function logs
4. Should see successful API calls to Gemini

## 🆘 Still Not Working?

1. **Double-check the key:**
   - Copy it fresh from Google AI Studio
   - Ensure no extra spaces
   - Ensure it's the full key

2. **Check Vercel logs:**
   - Look for the debug output: "GEMINI_API_KEY check:"
   - This shows if the key is being read

3. **Verify API route:**
   - Check that `/api/gemini` exists
   - Check that it's a serverless function (not a static file)

4. **Test with a simple curl:**
   - Use the curl command above
   - Check the response

---

**Need more help?** Check the Vercel function logs for detailed error messages.

