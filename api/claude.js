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

  const systemPrompt = `You are the Debate Mate Productive Mode AI. Your goal is to guide couples from conflict to connection. 
CRITICAL MOAT INSTRUCTION: Use the Gottman Method to identify the "Volume" of the Four Horsemen (Criticism, Contempt, Defensiveness, Stonewalling).

Output ONLY JSON in this format: { "alignment": number, "friction": number, "comm_block": "string", "insight": "string", "radarData": { "user": { "Criticism": number, "Contempt": number, "Defensiveness": number, "Stonewalling": number }, "partner": { "Criticism": number, "Contempt": number, "Defensiveness": number, "Stonewalling": number } } }.

The "alignment" should be a number 1-10 representing communication health. The "friction" should be a number 1-10 representing conflict intensity. The "comm_block" must identify the primary communication barrier. The "insight" should be 2-3 sentences explaining the breakdown. The "radarData" should contain scores 0-10 for each Horseman for both participants (Low=2, Medium=5, High=8).`;

  const userPrompt = `${person1Name || "Person 1"}'s argument: "${person1Argument}"

${person2Name || "Person 2"}'s argument: "${person2Argument}"

Analyze this communication exchange using the Gottman Method.`;

  try {
    // Get base URL and model from environment variables, with defaults
    const baseUrl = process.env.CLAUDE_BASE_URL || "https://api.anthropic.com/v1/messages";
    const model = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
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

    // Try to parse JSON from response
    let jsonResponse;
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        jsonResponse = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      // Fallback: return raw content if JSON parsing fails
      return res.status(200).json({ content });
    }

    // Validate JSON structure
    if (!jsonResponse.alignment || jsonResponse.friction === undefined || !jsonResponse.comm_block || !jsonResponse.insight) {
      console.error("Invalid JSON structure:", jsonResponse);
      return res.status(200).json({ content }); // Fallback to raw content
    }

    return res.status(200).json({ content: JSON.stringify(jsonResponse) });
  } catch (error) {
    // Never expose error details that might contain API keys
    console.error("Claude API handler error:", error.message);
    return res.status(500).json({
      error: "An error occurred while processing your request",
    });
  }
}

