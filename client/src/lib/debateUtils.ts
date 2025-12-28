export type DebateMode = 'petty' | 'productive';

export interface DebateResult {
  id: string;
  mode: DebateMode;
  person1Name: string;
  person2Name: string;
  person1Argument: string;
  person2Argument: string;
  winner: string;
  winnerScore: number;
  loserScore: number;
  analysis: string;
  timestamp: number;
}

export interface Scoreboard {
  [name: string]: {
    wins: number;
    losses: number;
    totalScore: number;
  };
}

const STORAGE_KEY = 'debate-mate-history';
const SCOREBOARD_KEY = 'debate-mate-scoreboard';

export function saveDebateResult(result: DebateResult): void {
  const history = getDebateHistory();
  history.push(result);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  updateScoreboard(result);
}

export function getDebateHistory(mode?: DebateMode): DebateResult[] {
  const history = localStorage.getItem(STORAGE_KEY);
  const debates = history ? JSON.parse(history) : [];
  
  if (mode) {
    return debates.filter((d: DebateResult) => d.mode === mode);
  }
  
  return debates.sort((a: DebateResult, b: DebateResult) => b.timestamp - a.timestamp);
}

export function getScoreboard(): Scoreboard {
  const scoreboard = localStorage.getItem(SCOREBOARD_KEY);
  return scoreboard ? JSON.parse(scoreboard) : {};
}

export function updateScoreboard(result: DebateResult): void {
  const scoreboard = getScoreboard();
  
  // Initialize if not exists
  if (!scoreboard[result.winner]) {
    scoreboard[result.winner] = { wins: 0, losses: 0, totalScore: 0 };
  }
  if (!scoreboard[result.person1Name === result.winner ? result.person2Name : result.person1Name]) {
    const loserName = result.person1Name === result.winner ? result.person2Name : result.person1Name;
    scoreboard[loserName] = { wins: 0, losses: 0, totalScore: 0 };
  }
  
  // Update winner
  scoreboard[result.winner].wins += 1;
  scoreboard[result.winner].totalScore += result.winnerScore;
  
  // Update loser
  const loserName = result.person1Name === result.winner ? result.person2Name : result.person1Name;
  scoreboard[loserName].losses += 1;
  scoreboard[loserName].totalScore += result.loserScore;
  
  localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(scoreboard));
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SCOREBOARD_KEY);
}

export function generateShareableImage(result: DebateResult): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, 600, 800);
  if (result.mode === 'petty') {
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FF8C00');
    gradient.addColorStop(1, '#FF1493');
  } else {
    gradient.addColorStop(0, '#4B0082');
    gradient.addColorStop(0.5, '#9370DB');
    gradient.addColorStop(1, '#00CED1');
  }
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 800);
  
  // Draw semi-transparent overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(0, 0, 600, 800);
  
  // Draw trophy emoji or text
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', 300, 150);
  
  // Draw winner name
  ctx.font = 'bold 48px Poppins';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${result.winner} WON!`, 300, 280);
  
  // Draw scores
  ctx.font = 'bold 36px Poppins';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`${result.winnerScore}/10`, 300, 380);
  
  // Draw analysis
  ctx.font = '18px Poppins';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  const maxWidth = 500;
  const lineHeight = 28;
  
  const words = result.analysis.split(' ');
  let line = '';
  let y = 480;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, 300, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 300, y);
  
  // Draw branding
  ctx.font = 'bold 24px Poppins';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ DebateMate ⚡', 300, 750);
  
  return canvas.toDataURL('image/png');
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseAIResponse(response: string): { winner: string; scores: [number, number]; analysis: string } | null {
  try {
    const lines = response.split('\n');
    let winner = '';
    let scores: [number, number] = [0, 0];
    let analysis = '';
    
    for (const line of lines) {
      if (line.includes('STRONGER_ARGUMENT:')) {
        winner = line.split(':')[1].trim();
      } else if (line.includes('SCORE:')) {
        const scoreStr = line.split(':')[1].trim();
        const scoreMatch = scoreStr.match(/(\d+)\/10.*?(\d+)\/10/);
        if (scoreMatch) {
          scores = [parseInt(scoreMatch[1]), parseInt(scoreMatch[2])];
        }
      } else if (line.includes('ANALYSIS:')) {
        analysis = line.split(':')[1].trim();
      }
    }
    
    if (winner && scores[0] > 0) {
      return { winner, scores, analysis };
    }
  } catch (e) {
    console.error('Error parsing AI response:', e);
  }
  
  return null;
}
