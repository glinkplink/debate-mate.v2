import React, { useEffect, useMemo, useState } from "react";
import { analyzeDebate } from "./lib/aiService";
import {
  getDebateHistory,
  getScoreboard,
  parseAIResponse,
  saveDebateResult,
  saveToHistory,
  getUnifiedHistory,
  getMostFoughtTopic,
} from "./lib/debateUtils";
import { sanitizeInput, validateInputLength, checkRateLimit } from "./lib/security";
import SocialShareBar from "./components/SocialShareBar";
import ExportBar from "./components/ExportBar";
import CommunicationHealthRadar from "./components/CommunicationHealthRadar";
import PettyResultCard from "./components/PettyResultCard";

function App() {
  const [mode, setMode] = useState("petty");
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => getDebateHistory());
  const [scoreboard, setScoreboard] = useState(() => getScoreboard());
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    setHistory(getDebateHistory());
    setScoreboard(getScoreboard());
  }, []);

  const unifiedHistory = useMemo(() => getUnifiedHistory(), [history, result]);
  const historyCount = unifiedHistory.length;
  const showPaywall = historyCount >= 10;
  const mostFoughtTopic = useMemo(() => getMostFoughtTopic(), [historyCount]);

  const modeLabel = mode === "petty" ? "Petty" : "Productive";
  const accent =
    mode === "petty"
      ? "from-orange-500 to-pink-500"
      : "from-indigo-500 to-sky-500";

  const MAX_LENGTH = 500;
  
  const disableAnalyze =
    loading ||
    !text1.trim() ||
    !text2.trim() ||
    text1.length > MAX_LENGTH ||
    text2.length > MAX_LENGTH;

  const historyPreview = useMemo(() => {
    const unified = getUnifiedHistory();
    return unified.slice(0, 5);
  }, [unifiedHistory]);

  const handleAnalyze = async () => {
    if (disableAnalyze) return;

    // Check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      setError(rateLimit.message || "Rate limit exceeded. Please wait before trying again.");
      return;
    }

    setLoading(true);
    setError("");

    // Sanitize and validate inputs
    const sanitizedName1 = sanitizeInput(name1 || "Person 1");
    const sanitizedName2 = sanitizeInput(name2 || "Person 2");
    const sanitizedText1 = validateInputLength(text1, MAX_LENGTH);
    const sanitizedText2 = validateInputLength(text2, MAX_LENGTH);

    if (!sanitizedText1.trim() || !sanitizedText2.trim()) {
      setError("Please provide valid arguments for both perspectives.");
      setLoading(false);
      return;
    }

    try {
      const raw = await analyzeDebate(
        mode,
        sanitizedName1,
        sanitizedText1,
        sanitizedName2,
        sanitizedText2
      );

      // For productive mode, don't parse scores (new format doesn't use them)
      let parsed;
      let winnerName, winnerScore, loserScore;
      
      if (mode === "productive") {
        // Productive mode uses Gottman Method, no winner/scores
        parsed = { analysis: raw };
        winnerName = "Both participants";
        winnerScore = 0;
        loserScore = 0;
      } else {
        // Petty mode uses old parsing
        parsed = parseAIResponse(raw) || {
          winner: name1 || "Person 1",
          scores: [8, 6],
          analysis: "Quick take: solid points on both sides.",
        };
        const [scoreA, scoreB] = parsed.scores;
        winnerName = parsed.winner || name1 || "Person 1";
        const isName1Winner = winnerName === (name1 || "Person 1");
        winnerScore = isName1Winner ? scoreA : scoreB;
        loserScore = isName1Winner ? scoreB : scoreA;
      }

      const resultEntry = {
        id: `${Date.now()}`,
        mode,
        person1Name: name1 || "Person 1",
        person2Name: name2 || "Person 2",
        person1Argument: text1,
        person2Argument: text2,
        winner: winnerName,
        winnerScore,
        loserScore,
        analysis: parsed.analysis || parsed.roast || "No detailed analysis provided.",
        fatalFlaw: parsed.fatalFlaw || parsed.fallacy || null, // Store fatal flaw for petty mode
        score: parsed.score || null, // Store score in "X-Y" format for JSON responses
        fallacy: parsed.fallacy || null,
        roast: parsed.roast || null,
        rawResponse: mode === "productive" ? raw : (mode === "petty" ? raw : null), // Store raw response for both modes
        timestamp: Date.now(),
      };

      saveDebateResult(resultEntry);
      
      // Save to unified history
      const inputText = `${name1 || "Person 1"}: ${text1} vs ${name2 || "Person 2"}: ${text2}`;
      const resultText = mode === "productive" 
        ? parsed.analysis || "No detailed analysis provided."
        : `${winnerName} wins (${winnerScore}/10 vs ${loserScore}/10). ${parsed.analysis || "No detailed analysis provided."}`;
      saveToHistory(mode, inputText, resultText);
      
      setResult(resultEntry);
      // Refresh both history formats
      setHistory(getDebateHistory());
      setScoreboard(getScoreboard());
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong while analyzing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName1("");
    setName2("");
    setText1("");
    setText2("");
    setResult(null);
  };

  const handleKeyDown = (e) => {
    // Enter without Shift triggers analyze
    if (e.key === "Enter" && !e.shiftKey && !disableAnalyze) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Debate Mate
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold">
                Settle arguments in seconds.
              </h1>
              <p className="text-white/70 text-sm">
                Drop two perspectives, pick the vibe, get an instant ruling.
              </p>
            </div>
            <button
              onClick={() =>
                setMode((prev) => (prev === "petty" ? "productive" : "petty"))
              }
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${accent} shadow-lg transition`}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
              {modeLabel} Mode
            </button>
          </header>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wide text-white/60">
                Name 1
              </label>
              <input
                value={name1}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  setName1(sanitized.slice(0, 50)); // Limit name length
                }}
                onKeyDown={handleKeyDown}
                placeholder="Person 1 (optional)"
                maxLength={50}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <label className="text-xs uppercase tracking-wide text-white/60">
                Perspective 1 {text1.length > MAX_LENGTH && (
                  <span className="text-red-400">({text1.length}/{MAX_LENGTH})</span>
                )}
              </label>
              <textarea
                value={text1}
                onChange={(e) => {
                  const sanitized = validateInputLength(e.target.value, MAX_LENGTH);
                  setText1(sanitized);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Their argument..."
                rows={6}
                maxLength={MAX_LENGTH}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wide text-white/60">
                Name 2
              </label>
              <input
                value={name2}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  setName2(sanitized.slice(0, 50)); // Limit name length
                }}
                onKeyDown={handleKeyDown}
                placeholder="Person 2 (optional)"
                maxLength={50}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <label className="text-xs uppercase tracking-wide text-white/60">
                Perspective 2 {text2.length > MAX_LENGTH && (
                  <span className="text-red-400">({text2.length}/{MAX_LENGTH})</span>
                )}
              </label>
              <textarea
                value={text2}
                onChange={(e) => {
                  const sanitized = validateInputLength(e.target.value, MAX_LENGTH);
                  setText2(sanitized);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Their argument..."
                rows={6}
                maxLength={MAX_LENGTH}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              disabled={disableAnalyze}
              className={`flex-1 rounded-xl px-4 py-3 text-white font-semibold shadow-lg transition bg-gradient-to-r ${accent} ${
                disableAnalyze ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01]"
              }`}
            >
              {loading ? "Analyzing..." : "Analyze debate"}
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl px-4 py-3 border border-white/15 text-white/80 font-semibold hover:bg-white/5 transition"
            >
              Reset
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {result && mode === "productive" && result.rawResponse && (
            <CommunicationHealthRadar 
              claudeResponse={result.rawResponse}
              person1Name={result.person1Name}
              person2Name={result.person2Name}
            />
          )}

          {result && mode === "petty" && (
            <PettyResultCard
              result={{
                winner: result.winner,
                score: result.score || `${result.winnerScore}-${result.loserScore}`,
                fallacy: result.fatalFlaw || result.fallacy,
                roast: result.roast || result.analysis
              }}
              person1Name={result.person1Name}
              person2Name={result.person2Name}
            />
          )}

          {result && mode === "productive" && result.rawResponse && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                  {modeLabel} mode
                </span>
              </div>
              
              {/* Parse and display sections */}
              {(() => {
                const response = result.rawResponse || "";
                const breakdownMatch = response.match(/THE BREAKDOWN:?[\s\S]*?(?=THE REPAIR|ACTIONABLE|$)/i);
                const repairMatch = response.match(/THE REPAIR:?[\s\S]*?(?=$)/i);
                
                return (
                  <>
                    {breakdownMatch && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">The Breakdown</h3>
                        <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                          {breakdownMatch[0].replace(/THE BREAKDOWN:?/i, "").trim()}
                        </p>
                      </div>
                    )}
                    
                    {repairMatch && (
                      <div className="relative">
                        <div className="blur-sm select-none pointer-events-none">
                          <h3 className="text-lg font-semibold text-white mb-2">The Repair</h3>
                          <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                            {repairMatch[0].replace(/THE REPAIR:?/i, "").trim()}
                          </p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg">
                          <div className="text-center p-6">
                            <h4 className="text-xl font-semibold text-white mb-2">Unlock Expert Resolution Plan</h4>
                            <p className="text-white/80 mb-4 text-sm">Get personalized repair attempts and conflict resolution strategies</p>
                            <button 
                              onClick={() => {
                                // Handle subscription/paywall logic here
                                alert("Redirecting to subscription page...");
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-sky-600 transition-all shadow-lg"
                            >
                              Subscribe - $19/mo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </section>
          )}

          {result && (
            <>
              {mode === "petty" && <SocialShareBar result={result} mode={mode} />}
              {mode === "productive" && <ExportBar result={result} mode={mode} />}
            </>
          )}

          <section className={`mt-6 grid gap-4 ${mode === "petty" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Recent history</h3>
                {historyCount > 5 && (
                  <button
                    onClick={() => setHistoryExpanded(!historyExpanded)}
                    className="text-xs text-white/60 hover:text-white/80 transition"
                  >
                    {historyExpanded ? "Collapse" : `View ${historyCount} squabbles`}
                  </button>
                )}
              </div>
              
              {showPaywall && !historyExpanded && (
                <div className="mb-3 rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-pink-500/10 p-3">
                  <p className="text-sm font-semibold text-white mb-1">
                    Unlock insights + unlimited - $19/mo
                  </p>
                  {mostFoughtTopic && (
                    <p className="text-xs text-white/70">
                      Your most fought topic: <span className="font-semibold">{mostFoughtTopic}</span>
                    </p>
                  )}
                </div>
              )}
              
              {historyPreview.length === 0 ? (
                <p className="text-sm text-white/60">No debates yet.</p>
              ) : (
                <>
                  <ul className="space-y-2 text-sm text-white/80">
                    {historyPreview.map((item) => {
                      const isSquabble = item.type === 'squabble' || item.mode === 'petty';
                      const isProductive = item.type === 'productive' || item.mode === 'productive';
                      
                      // Parse score from various formats
                      let score = item.score;
                      if (!score && isProductive) {
                        if (item.winnerScore) {
                          score = `${item.winnerScore}/10`;
                        } else if (item.result) {
                          const scoreMatch = item.result.match(/(\d+)\s*\/\s*10/i);
                          if (scoreMatch) {
                            score = `${scoreMatch[1]}/10`;
                          }
                        }
                      }
                      
                      // Get display text
                      const displayText = item.result || item.analysis || item.input || 'No details';
                      const displayDate = item.date || (item.timestamp ? new Date(item.timestamp).toLocaleString() : null);
                      
                      return (
                        <li
                          key={item.id || item.timestamp}
                          className="rounded-lg border border-white/10 px-3 py-2"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              {isSquabble && <span className="text-xs">🥊</span>}
                              {isProductive && <span className="text-xs">💔</span>}
                              <span className="font-semibold text-xs">
                                {isSquabble ? "Petty" : "Productive"}
                              </span>
                            </div>
                            {score && (
                              <span className="text-xs text-white/70 font-semibold">
                                {score}
                              </span>
                            )}
                          </div>
                          <p className="text-white/70 text-sm overflow-hidden text-ellipsis line-clamp-2">
                            {displayText}
                          </p>
                          {displayDate && (
                            <p className="text-xs text-white/50 mt-1">{displayDate}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  
                  {historyExpanded && historyCount > 5 && (
                    <ul className="space-y-2 text-sm text-white/80 mt-3">
                      {unifiedHistory.slice(5).map((item) => {
                        const isSquabble = item.type === 'squabble' || item.mode === 'petty';
                        const isProductive = item.type === 'productive' || item.mode === 'productive';
                        
                        // Parse score from various formats
                        let score = item.score;
                        if (!score && isProductive) {
                          if (item.winnerScore) {
                            score = `${item.winnerScore}/10`;
                          } else if (item.result) {
                            const scoreMatch = item.result.match(/(\d+)\s*\/\s*10/i);
                            if (scoreMatch) {
                              score = `${scoreMatch[1]}/10`;
                            }
                          }
                        }
                        
                        // Get display text
                        const displayText = item.result || item.analysis || item.input || 'No details';
                        const displayDate = item.date || (item.timestamp ? new Date(item.timestamp).toLocaleString() : null);
                        
                        return (
                          <li
                            key={item.id || item.timestamp}
                            className="rounded-lg border border-white/10 px-3 py-2"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                {isSquabble && <span className="text-xs">🥊</span>}
                                {isProductive && <span className="text-xs">💔</span>}
                                <span className="font-semibold text-xs">
                                  {isSquabble ? "Petty" : "Productive"}
                                </span>
                              </div>
                              {score && (
                                <span className="text-xs text-white/70 font-semibold">
                                  {score}
                                </span>
                              )}
                            </div>
                            <p className="text-white/70 text-sm overflow-hidden text-ellipsis line-clamp-2">
                              {displayText}
                            </p>
                            {displayDate && (
                              <p className="text-xs text-white/50 mt-1">{displayDate}</p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  
                  {showPaywall && historyExpanded && (
                    <div className="mt-3 rounded-lg border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-pink-500/10 p-3">
                      <p className="text-sm font-semibold text-white mb-1">
                        Unlock insights + unlimited - $19/mo
                      </p>
                      {mostFoughtTopic && (
                        <p className="text-xs text-white/70">
                          Your most fought topic: <span className="font-semibold">{mostFoughtTopic}</span>
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {mode === "petty" && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Scoreboard</h3>
                  <span className="text-xs text-white/60">Wins / Losses</span>
                </div>
                {Object.keys(scoreboard).length === 0 ? (
                  <p className="text-sm text-white/60">No stats yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm text-white/80">
                    {Object.entries(scoreboard).map(([name, stats]) => (
                      <li
                        key={name}
                        className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2"
                      >
                        <span className="font-semibold">{name}</span>
                        <span className="text-xs text-white/70">
                          {stats.wins}W / {stats.losses}L
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </div>
        <p className="text-center text-xs text-white/60">
          For entertainment and self-improvement only.
        </p>
      </div>
    </div>
  );
}

export default App;

