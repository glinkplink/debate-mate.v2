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
    const lines = response.split("\n").map((l) => l.trim()).filter(Boolean);
    let winner = "";
    let scores = [0, 0];
    let analysis = "";

    for (const line of lines) {
      if (line.toUpperCase().startsWith("STRONGER_ARGUMENT")) {
        winner = line.split(":")[1]?.trim() || "";
      }
      if (line.toUpperCase().startsWith("SCORE")) {
        const match = line.match(/(\d+)\s*\/\s*10.*?(\d+)\s*\/\s*10/);
        if (match) {
          scores = [parseInt(match[1], 10), parseInt(match[2], 10)];
        }
      }
      if (line.toUpperCase().startsWith("ANALYSIS")) {
        analysis = line.split(":")[1]?.trim() || "";
      }
    }

    if (!winner || scores[0] === 0) return null;
    return { winner, scores, analysis };
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

