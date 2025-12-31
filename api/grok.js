const MAX_INPUT_LENGTH = 500;
const MAX_NAME_LENGTH = 50;

function sanitizeString(str) {
  if (typeof str !== "string") return "";
  // Only remove HTML tags to prevent XSS - preserve all other content
  // The AI models can handle any text content, including inappropriate language
  return str.replace(/<[^>]*>/g, "");
}

function validateInputs(person1Name, person1Argument, person2Name, person2Argument) {
  const errors = [];

  if (!person1Argument || typeof person1Argument !== "string" || !person1Argument.trim()) {
    errors.push("Person 1 argument is required");
  } else if (person1Argument.length > MAX_INPUT_LENGTH) {
    errors.push(`Person 1 argument exceeds ${MAX_INPUT_LENGTH} characters`);
  }

  if (!person2Argument || typeof person2Argument !== "string" || !person2Argument.trim()) {
    errors.push("Person 2 argument is required");
  } else if (person2Argument.length > MAX_INPUT_LENGTH) {
    errors.push(`Person 2 argument exceeds ${MAX_INPUT_LENGTH} characters`);
  }

  if (person1Name && person1Name.length > MAX_NAME_LENGTH) {
    errors.push(`Person 1 name exceeds ${MAX_NAME_LENGTH} characters`);
  }

  if (person2Name && person2Name.length > MAX_NAME_LENGTH) {
    errors.push(`Person 2 name exceeds ${MAX_NAME_LENGTH} characters`);
  }

  return errors;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse request body if needed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON in request body" });
    }
  }

  // Sanitize inputs - only remove HTML/XSS, preserve all other content
  let person1Name = body?.person1Name || "";
  let person1Argument = body?.person1Argument || "";
  let person2Name = body?.person2Name || "";
  let person2Argument = body?.person2Argument || "";

  // Only sanitize if they're strings (prevent XSS)
  if (typeof person1Name === "string") person1Name = sanitizeString(person1Name);
  if (typeof person1Argument === "string") person1Argument = sanitizeString(person1Argument);
  if (typeof person2Name === "string") person2Name = sanitizeString(person2Name);
  if (typeof person2Argument === "string") person2Argument = sanitizeString(person2Argument);

  // Validate inputs - only check for required fields and length, not content
  const validationErrors = validateInputs(person1Name, person1Argument, person2Name, person2Argument);
  if (validationErrors.length > 0) {
    return res.status(400).json({ error: validationErrors.join("; ") });
  }

  // Check API key (never expose in errors)
  const apiKey = process.env.VITE_GROK_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-grok-api-key-here" || apiKey.includes("placeholder")) {
    console.error("VITE_GROK_API_KEY environment variable is not set or is a placeholder");
    return res.status(500).json({ error: "Service configuration error" });
  }
  
  // Additional validation: ensure API key format is reasonable
  if (apiKey.length < 20) {
    console.error("VITE_GROK_API_KEY appears to be invalid format (length:", apiKey.length, ")");
    return res.status(500).json({ error: "Service configuration error" });
  }

  const systemPrompt = `You are a sarcastic debate referee with humor. Judge arguments but keep it entertaining. Be witty but not mean. Focus on funny observations while being fair.

Respond in this exact format:
STRONGER_ARGUMENT: [Name]
SCORE: [X/10 for stronger, Y/10 for other]
ANALYSIS: [2-3 sentences]`;

  const userPrompt = `${person1Name || "Person 1"}'s argument: "${person1Argument}"

${person2Name || "Person 2"}'s argument: "${person2Argument}"

Who made the stronger argument?`;

  try {
    // Get base URL and model from environment variables, with defaults
    const baseUrl = process.env.VITE_GROK_BASE_URL || "https://api.x.ai/v1/chat/completions";
    const model = process.env.VITE_GROK_MODEL || "grok-4-1-fast-non-reasoning";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      // Never expose API keys or sensitive details in error messages
      const status = response.status;
      let errorMessage = "Failed to analyze debate";
      
      // Log full error server-side only (not exposed to client)
      try {
        const errorText = await response.text();
        console.error(`Grok API error ${status}:`, errorText.substring(0, 200)); // Log truncated
      } catch {
        console.error(`Grok API error ${status}: Unable to read error response`);
      }

      // Return generic error to client
      if (status === 401 || status === 403) {
        errorMessage = "Authentication failed";
      } else if (status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (status >= 500) {
        errorMessage = "Service temporarily unavailable";
      } else if (status === 400) {
        errorMessage = "Unable to process request. Please try again.";
      } else {
        errorMessage = "Request failed. Please try again.";
      }

      return res.status(status).json({ error: errorMessage });
    }

    const data = await response.json();
    // Grok API response structure: data.choices[0].message.content
    const content = data?.choices?.[0]?.message?.content || "";

    // Validate response doesn't contain sensitive data
    if (content.toLowerCase().includes("api") && content.toLowerCase().includes("key")) {
      console.error("Response may contain sensitive data - sanitizing");
      return res.status(500).json({ error: "Invalid response format" });
    }

    return res.status(200).json({ content });
  } catch (error) {
    // Never expose error details that might contain API keys
    console.error("Grok API handler error:", error.message);
    return res.status(500).json({
      error: "An error occurred while processing your request",
    });
  }
}

