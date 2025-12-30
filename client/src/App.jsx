import React, { useEffect, useMemo, useState } from "react";
import { analyzeDebate } from "./lib/aiService";
import {
  getDebateHistory,
  getScoreboard,
  parseAIResponse,
  saveDebateResult,
} from "./lib/debateUtils";

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

  useEffect(() => {
    setHistory(getDebateHistory());
    setScoreboard(getScoreboard());
  }, []);

  const modeLabel = mode === "petty" ? "Petty" : "Productive";
  const accent =
    mode === "petty"
      ? "from-orange-500 to-pink-500"
      : "from-indigo-500 to-sky-500";

  const disableAnalyze =
    loading ||
    !text1.trim() ||
    !text2.trim();

  const historyPreview = useMemo(() => history.slice(0, 5), [history]);

  const handleAnalyze = async () => {
    if (disableAnalyze) return;
    setLoading(true);
    setError("");

    try {
      const raw = await analyzeDebate(
        mode,
        name1 || "Person 1",
        text1,
        name2 || "Person 2",
        text2
      );

      const parsed = parseAIResponse(raw) || {
        winner: name1 || "Person 1",
        scores: [8, 6],
        analysis: "Quick take: solid points on both sides.",
      };

      const [scoreA, scoreB] = parsed.scores;
      const winnerName = parsed.winner || name1 || "Person 1";
      const isName1Winner = winnerName === (name1 || "Person 1");
      const winnerScore = isName1Winner ? scoreA : scoreB;
      const loserScore = isName1Winner ? scoreB : scoreA;

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
        analysis: parsed.analysis || "No detailed analysis provided.",
        timestamp: Date.now(),
      };

      saveDebateResult(resultEntry);
      setResult(resultEntry);
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
                onChange={(e) => setName1(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Person 1 (optional)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <label className="text-xs uppercase tracking-wide text-white/60">
                Perspective 1
              </label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Their argument..."
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wide text-white/60">
                Name 2
              </label>
              <input
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Person 2 (optional)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <label className="text-xs uppercase tracking-wide text-white/60">
                Perspective 2
              </label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Their argument..."
                rows={6}
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

          {result && (
            <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">
                    Winner
                  </p>
                  <h2 className="text-2xl font-semibold">{result.winner}</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                  {modeLabel} mode
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-white/80">
                <span className="rounded-lg bg-white/10 px-3 py-1">
                  {result.person1Name}:{" "}
                  {result.winner === result.person1Name
                    ? result.winnerScore
                    : result.loserScore}
                  /10
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-1">
                  {result.person2Name}:{" "}
                  {result.winner === result.person2Name
                    ? result.winnerScore
                    : result.loserScore}
                  /10
                </span>
              </div>
              <p className="text-white/80 leading-relaxed">{result.analysis}</p>
            </section>
          )}

          <section className={`mt-6 grid gap-4 ${mode === "petty" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Recent history</h3>
                <span className="text-xs text-white/60">
                  Last {historyPreview.length || 0}
                </span>
              </div>
              {historyPreview.length === 0 ? (
                <p className="text-sm text-white/60">No debates yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-white/80">
                  {historyPreview.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-white/10 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.winner}</span>
                        <span className="text-xs uppercase text-white/60">
                          {item.mode}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.analysis}
                      </p>
                    </li>
                  ))}
                </ul>
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

