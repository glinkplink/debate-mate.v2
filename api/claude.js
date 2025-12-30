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

  // Sanitize inputs - only remove HTML/XSS, preserve all text content
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
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-claude-api-key-here" || apiKey.includes("placeholder")) {
    console.error("CLAUDE_API_KEY environment variable is not set or is a placeholder");
    return res.status(500).json({ error: "Service configuration error" });
  }
  
  // Additional validation: ensure API key format is reasonable (Anthropic keys typically start with sk-ant-)
  if (!apiKey.startsWith("sk-ant-") && apiKey.length < 20) {
    console.error("CLAUDE_API_KEY appears to be invalid format");
    return res.status(500).json({ error: "Service configuration error" });
  }

  const systemPrompt = `You are an impartial debate analyzer for serious discussions. Evaluate objectively based on: Logic/evidence (40%), Tone/emotional intelligence (30%), Clarity/communication (30%). Provide constructive feedback in a professional, supportive tone.

Respond in this exact format:
STRONGER_ARGUMENT: [Name]
SCORE: [X/10 for stronger, Y/10 for other]
ANALYSIS: [2-3 sentences]`;

  const userPrompt = `${person1Name || "Person 1"}'s argument: "${person1Argument}"

${person2Name || "Person 2"}'s argument: "${person2Argument}"

Who made the stronger argument?`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      // Never expose API keys or sensitive details in error messages
      const status = response.status;
      let errorMessage = "Failed to analyze debate";
      
      // Log full error server-side only (not exposed to client)
      try {
        const errorText = await response.text();
        console.error(`Claude API error ${status}:`, errorText.substring(0, 200)); // Log truncated
      } catch {
        console.error(`Claude API error ${status}: Unable to read error response`);
      }

      // Return generic error to client
      if (status === 401 || status === 403) {
        errorMessage = "Authentication failed";
      } else if (status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (status >= 500) {
        errorMessage = "Service temporarily unavailable";
      } else if (status === 400) {
        // 400 from Claude API - might be content-related, but we pass through everything
        errorMessage = "Unable to process request. Please try again.";
      } else {
        errorMessage = "Request failed. Please try again.";
      }

      return res.status(status).json({ error: errorMessage });
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text || "";

    // Validate response doesn't contain sensitive data
    if (content.toLowerCase().includes("api") && content.toLowerCase().includes("key")) {
      console.error("Response may contain sensitive data - sanitizing");
      return res.status(500).json({ error: "Invalid response format" });
    }

    return res.status(200).json({ content });
  } catch (error) {
    // Never expose error details that might contain API keys
    console.error("Claude API handler error:", error.message);
    return res.status(500).json({
      error: "An error occurred while processing your request",
    });
  }
}

