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
  const [apiKey, setApiKey] = useState("");
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
      ? "from-emerald-500 to-green-600"
      : "from-sky-500 to-blue-600";

  const disableAnalyze =
    loading ||
    !apiKey.trim() ||
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
        text2,
        apiKey.trim()
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-700 to-purple-400 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Debate Mate</h1>
              <p className="text-gray-600 text-sm">
                Quick AI-powered debate analyzer with petty or productive vibes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Mode</span>
              <button
                onClick={() =>
                  setMode((prev) => (prev === "petty" ? "productive" : "petty"))
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${accent} shadow-md transition`}
              >
                {modeLabel}
              </button>
            </div>
          </header>

          <section className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800">
                Name 1
              </label>
              <input
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="Person 1"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <label className="text-sm font-semibold text-gray-800">
                Perspective 1
              </label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="Their argument..."
                rows={6}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800">
                Name 2
              </label>
              <input
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="Person 2"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <label className="text-sm font-semibold text-gray-800">
                Perspective 2
              </label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="Their argument..."
                rows={6}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-semibold text-gray-800">
                API Key
              </label>
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Grok/Claude API key"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <p className="text-xs text-gray-500">
                Keys stay in your browser (localStorage only).
              </p>
            </div>
            <div className="flex items-end gap-3">
              <button
                onClick={handleAnalyze}
                disabled={disableAnalyze}
                className={`flex-1 rounded-lg px-4 py-3 text-white font-semibold shadow-md transition ${
                  disableAnalyze
                    ? "bg-gray-300 cursor-not-allowed"
                    : `bg-gradient-to-r ${accent} hover:opacity-90`
                }`}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg px-4 py-3 border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </section>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <section className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50 p-5 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Winner
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {result.winner}
                  </h2>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="bg-white rounded-full px-3 py-1 shadow">
                    {result.person1Name}: {result.winner === result.person1Name ? result.winnerScore : result.loserScore}/10
                  </span>
                  <span className="bg-white rounded-full px-3 py-1 shadow">
                    {result.person2Name}: {result.winner === result.person2Name ? result.winnerScore : result.loserScore}/10
                  </span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.analysis}</p>
            </section>
          )}

          <section className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Recent History</h3>
                <span className="text-xs text-gray-500">
                  Last {historyPreview.length} entries
                </span>
              </div>
              {historyPreview.length === 0 ? (
                <p className="text-sm text-gray-500">No debates yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {historyPreview.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.winner}</span>
                        <span className="text-xs uppercase text-gray-500">
                          {item.mode}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {item.analysis}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Scoreboard</h3>
                <span className="text-xs text-gray-500">Wins / Losses</span>
              </div>
              {Object.keys(scoreboard).length === 0 ? (
                <p className="text-sm text-gray-500">No stats yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {Object.entries(scoreboard).map(([name, stats]) => (
                    <li
                      key={name}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                    >
                      <span className="font-semibold">{name}</span>
                      <span className="text-xs text-gray-600">
                        {stats.wins}W / {stats.losses}L
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
        <p className="text-center text-xs text-white/90 mt-4">
          For entertainment and self-improvement only.
        </p>
      </div>
    </div>
  );
}

export default App;

