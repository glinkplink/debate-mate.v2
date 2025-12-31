const HISTORY_KEY = "debate-mate-history";
const SCOREBOARD_KEY = "debate-mate-scoreboard";

export function getDebateHistory(mode) {
  const stored = safeParse(localStorage.getItem(HISTORY_KEY), []);
  if (!mode) return stored.sort((a, b) => b.timestamp - a.timestamp);
  return stored.filter((item) => item.mode === mode).sort((a, b) => b.timestamp - a.timestamp);
}

export function saveDebateResult(result) {
  const history = getDebateHistory();
  history.unshift(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  updateScoreboard(result);
}

// Unified history function for both modes
export function saveToHistory(type, input, result) {
  const history = getDebateHistory();
  
  // Parse score from result if it's productive mode
  // Look for patterns like "7/10" or "wins (7/10 vs 5/10)"
  let score = null;
  if (type === 'productive' && result) {
    // Try to find "X/10" pattern
    const scoreMatch = result.match(/(\d+)\s*\/\s*10/i);
    if (scoreMatch) {
      score = `${scoreMatch[1]}/10`;
    }
    // Also try to find "wins (X/10 vs Y/10)" pattern
    const winsMatch = result.match(/wins\s*\((\d+)\s*\/\s*10/i);
    if (winsMatch) {
      score = `${winsMatch[1]}/10`;
    }
  }
  
  const entry = {
    id: Date.now(),
    type: type === 'petty' ? 'squabble' : 'productive',
    input: input,
    result: result,
    date: new Date().toLocaleString(),
    timestamp: Date.now(),
    score: score
  };
  
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

// Get unified history (both modes combined)
export function getUnifiedHistory() {
  const stored = safeParse(localStorage.getItem(HISTORY_KEY), []);
  return stored.sort((a, b) => (b.timestamp || b.id || 0) - (a.timestamp || a.id || 0));
}

// Get most common word from history entries
export function getMostFoughtTopic() {
  const history = getUnifiedHistory();
  const wordCount = {};
  
  history.forEach(entry => {
    if (entry.input) {
      const words = entry.input.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3); // Only words longer than 3 chars
      
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    }
  });
  
  const sorted = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

export function getScoreboard() {
  return safeParse(localStorage.getItem(SCOREBOARD_KEY), {});
}

function updateScoreboard(result) {
  const board = getScoreboard();
  const winner = result.winner;
  const loser = result.person1Name === winner ? result.person2Name : result.person1Name;

  if (!board[winner]) board[winner] = { wins: 0, losses: 0, totalScore: 0 };
  if (!board[loser]) board[loser] = { wins: 0, losses: 0, totalScore: 0 };

  board[winner].wins += 1;
  board[winner].totalScore += result.winnerScore || 0;
  board[loser].losses += 1;
  board[loser].totalScore += result.loserScore || 0;

  localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(board));
}

export function parseAIResponse(response) {
  if (!response) return null;
  try {
    // First, try to parse as JSON (new format)
    try {
      const jsonData = typeof response === 'string' ? JSON.parse(response) : response;
      if (jsonData.winner && jsonData.score && jsonData.fallacy && jsonData.roast) {
        // Parse score from "X-Y" format
        const scoreMatch = jsonData.score.match(/(\d+)-(\d+)/);
        const scores = scoreMatch 
          ? [parseInt(scoreMatch[1], 10), parseInt(scoreMatch[2], 10)]
          : [8, 6];
        
        return {
          winner: jsonData.winner,
          scores: scores,
          analysis: jsonData.roast,
          fatalFlaw: jsonData.fallacy,
          score: jsonData.score, // Keep original format
          fallacy: jsonData.fallacy,
          roast: jsonData.roast
        };
      }
    } catch (jsonError) {
      // Not JSON, continue with text parsing
    }

    // Fallback: parse text format (old format)
    const lines = response.split("\n").map((l) => l.trim()).filter(Boolean);
    let winner = "";
    let scores = [0, 0];
    let analysis = "";
    let fatalFlaw = "";

    for (const line of lines) {
      if (line.toUpperCase().startsWith("STRONGER_ARGUMENT")) {
        winner = line.split(":")[1]?.trim() || "";
      }
      if (line.toUpperCase().startsWith("SCORE")) {
        // Try to match single score format: "SCORE: 8/10" or "SCORE: [8/10]"
        const singleMatch = line.match(/(\d+)\s*\/\s*10/);
        if (singleMatch) {
          const score = parseInt(singleMatch[1], 10);
          // If we have a winner, assign score to winner, loser gets lower score
          if (winner) {
            scores = [score, Math.max(1, score - 2)]; // Winner gets the score, loser gets 2 points less
          } else {
            scores = [score, score];
          }
        } else {
          // Fallback: try to match two scores format
          const doubleMatch = line.match(/(\d+)\s*\/\s*10.*?(\d+)\s*\/\s*10/);
          if (doubleMatch) {
            scores = [parseInt(doubleMatch[1], 10), parseInt(doubleMatch[2], 10)];
          }
        }
      }
      if (line.toUpperCase().startsWith("FATAL FLAW") || line.toUpperCase().startsWith("FATAL_FLAW")) {
        fatalFlaw = line.split(":")[1]?.trim() || "";
      }
      if (line.toUpperCase().startsWith("ANALYSIS")) {
        analysis = line.split(":")[1]?.trim() || "";
      }
    }

    // If we have winner and score, return parsed data
    if (winner && scores[0] > 0) {
      return { winner, scores, analysis, fatalFlaw };
    }
    return null;
  } catch (err) {
    console.error("Failed to parse AI response", err);
    return null;
  }
}

function safeParse(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

