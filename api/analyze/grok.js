export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { person1Name, person1Argument, person2Name, person2Argument } = req.body;

  if (!person1Argument || !person2Argument) {
    return res.status(400).json({ error: "Both arguments are required" });
  }

  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Grok API key not configured" });
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
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
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
      return res.status(response.status).json({
        error: `Grok API error: ${response.status}`,
        details: text,
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";

    return res.status(200).json({ content });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to analyze debate",
      details: error.message,
    });
  }
}

