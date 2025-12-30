export async function analyzeDebate(
  mode,
  person1Name,
  person1Argument,
  person2Name,
  person2Argument
) {
  const endpoint = mode === "petty" ? "/api/analyze/grok" : "/api/analyze/claude";

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
    const error = await response.json();
    throw new Error(error.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content || "";
}

