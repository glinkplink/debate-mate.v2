const GROK_API_URL = "https://api.x.ai/v1/chat/completions";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

export async function analyzeDebate(
  mode,
  person1Name,
  person1Argument,
  person2Name,
  person2Argument,
  apiKey
) {
  if (mode === "petty") {
    return analyzeWithGrok(person1Name, person1Argument, person2Name, person2Argument, apiKey);
  }
  return analyzeWithClaude(person1Name, person1Argument, person2Name, person2Argument, apiKey);
}

async function analyzeWithGrok(person1Name, person1Argument, person2Name, person2Argument, apiKey) {
  const systemPrompt = `You are a sarcastic debate referee with humor. Judge arguments but keep it entertaining. Be witty but not mean. Focus on funny observations while being fair.

Respond in this exact format:
STRONGER_ARGUMENT: [Name]
SCORE: [X/10 for stronger, Y/10 for other]
ANALYSIS: [2-3 sentences]`;

  const userPrompt = `${person1Name}'s argument: "${person1Argument}"

${person2Name}'s argument: "${person2Argument}"

Who made the stronger argument?`;

  const response = await fetch(GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Grok API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function analyzeWithClaude(person1Name, person1Argument, person2Name, person2Argument, apiKey) {
  const systemPrompt = `You are an impartial debate analyzer for serious discussions. Evaluate objectively based on: Logic/evidence (40%), Tone/emotional intelligence (30%), Clarity/communication (30%). Provide constructive feedback in a professional, supportive tone.

Respond in this exact format:
STRONGER_ARGUMENT: [Name]
SCORE: [X/10 for stronger, Y/10 for other]
ANALYSIS: [2-3 sentences]`;

  const userPrompt = `${person1Name}'s argument: "${person1Argument}"

${person2Name}'s argument: "${person2Argument}"

Who made the stronger argument?`;

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Claude API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text || "";
}

