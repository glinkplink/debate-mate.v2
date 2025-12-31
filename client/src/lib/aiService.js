import { validateAPIResponse } from "./security";

export async function analyzeDebate(
  mode,
  person1Name,
  person1Argument,
  person2Name,
  person2Argument
) {
  const endpoint = mode === "petty" ? "/api/grok" : "/api/claude";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      person1Name,
      person1Argument,
      person2Name,
      person2Argument,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      // Never expose API keys or sensitive details
      errorMessage = errorData.error || errorMessage;
      // Remove any potential sensitive data
      errorMessage = errorMessage.replace(/api[_-]?key/gi, "[REDACTED]");
      errorMessage = errorMessage.replace(/bearer\s+[a-z0-9_-]+/gi, "[REDACTED]");
    } catch {
      // If JSON parsing fails, use generic error
      errorMessage = "An error occurred. Please try again.";
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Validate response structure and check for leaks
  const validation = validateAPIResponse(data);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid response from server");
  }

  return data.content || "";
}

