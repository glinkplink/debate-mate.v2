export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { person1Name, person1Argument, person2Name, person2Argument } = req.body;

  if (!person1Argument || !person2Argument) {
    return res.status(400).json({ error: "Both arguments are required" });
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Claude API key not configured" });
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
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Claude API error: ${response.status}`,
        details: text,
      });
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text || "";

    return res.status(200).json({ content });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to analyze debate",
      details: error.message,
    });
  }
}

