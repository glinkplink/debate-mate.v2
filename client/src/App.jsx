import React, { useEffect, useMemo, useState } from "react";
import { analyzeDebate } from "./lib/aiService";
import {
  parseAIResponse,
  saveDebateResult,
  saveToHistory,
} from "./lib/debateUtils";
import { sanitizeInput, validateInputLength, checkRateLimit } from "./lib/security";
import SocialShareBar from "./components/SocialShareBar";
import ExportBar from "./components/ExportBar";
import CommunicationHealthRadar from "./components/CommunicationHealthRadar";
import PettyResultCard from "./components/PettyResultCard";
import ShareHub from "./components/ShareHub";

function App() {
  const [mode, setMode] = useState("petty");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [gauntletSent, setGauntletSent] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const [showShareHub, setShowShareHub] = useState(false);

  useEffect(() => {
    // Check for challenge link data
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(window.atob(dataParam));
        if (decoded.mode && decoded.p1Arg) {
          setMode(decoded.mode);
          setText1(decoded.p1Arg);
          setIsChallengeMode(true);
        }
      } catch (err) {
        console.error("Failed to parse challenge data:", err);
      }
    }
  }, []);

  const modeLabel = mode === "petty" ? "AuraWars" : "Resolution";
  const modeTagline = mode === "petty" 
    ? "Drop takes, collect aura" 
    : "Settle the Friction";
  const accent =
    mode === "petty"
      ? "from-pink-500 to-orange-500"
      : "from-teal-500 to-blue-500";

  const MAX_LENGTH = 500;
  
  // Only allow analyze if both perspectives are filled
  const disableAnalyze =
    loading ||
    !text1.trim() ||
    !text2.trim() ||
    text1.length > MAX_LENGTH ||
    text2.length > MAX_LENGTH;

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
        "Person 1",
        sanitizedText1,
        "Person 2",
        sanitizedText2
      );

      // Parse response based on mode
      let parsed;
      let winnerName, winnerScore, loserScore;
      
      parsed = parseAIResponse(raw, mode);
      
      if (mode === "productive") {
        // Productive mode uses Gottman Method
        if (!parsed) {
          parsed = { 
            analysis: raw,
            alignment: 5,
            friction: 5,
            comm_block: "Communication breakdown",
            insight: raw
          };
        }
        winnerName = "Both participants";
        winnerScore = parsed.alignment || 5;
        loserScore = parsed.friction || 5;
      } else {
        // Petty mode
        if (!parsed) {
          parsed = {
            winner: "Person 1",
            scores: [8, 6],
            analysis: "Quick take: solid points on both sides.",
            aura: 8,
            cringe: 6
          };
        }
        const [scoreA, scoreB] = parsed.scores || [parsed.aura || 8, parsed.cringe || 6];
        winnerName = parsed.winner || "Person 1";
        const isName1Winner = winnerName === "Person 1";
        winnerScore = isName1Winner ? scoreA : scoreB;
        loserScore = isName1Winner ? scoreB : scoreA;
      }

      const resultEntry = {
        id: `${Date.now()}`,
        mode,
        person1Name: "Person 1",
        person2Name: "Person 2",
        person1Argument: text1,
        person2Argument: text2,
        winner: winnerName,
        winnerScore,
        loserScore,
        analysis: parsed.analysis || parsed.roast || parsed.insight || "No detailed analysis provided.",
        fatalFlaw: parsed.fatalFlaw || parsed.fallacy || parsed.skill_issue || null,
        score: parsed.score || null,
        fallacy: parsed.fallacy || parsed.skill_issue || null,
        roast: parsed.roast || parsed.insight || null,
        // Petty mode fields
        aura: parsed.aura || null,
        cringe: parsed.cringe || null,
        skill_issue: parsed.skill_issue || null,
        // Productive mode fields
        alignment: parsed.alignment || null,
        friction: parsed.friction || null,
        comm_block: parsed.comm_block || null,
        insight: parsed.insight || null,
        radarData: parsed.radarData || null,
        rawResponse: raw, // Store raw response for both modes
        timestamp: Date.now(),
      };

      saveDebateResult(resultEntry);
      
      // Save to unified history
      const inputText = `Person 1: ${text1} vs Person 2: ${text2}`;
      const resultText = mode === "productive" 
        ? parsed.analysis || "No detailed analysis provided."
        : `${winnerName} wins (${winnerScore}/10 vs ${loserScore}/10). ${parsed.analysis || "No detailed analysis provided."}`;
      saveToHistory(mode, inputText, resultText);
      
      setResult(resultEntry);
      setError(""); // Clear any previous errors on success
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMessage = err?.message || "Unable to process request. Please try again.";
      setError(errorMessage);
      
      // If it's a network error, provide more helpful message
      if (err.message?.includes("fetch") || err.message?.includes("network")) {
        setError("Network error. Please check your connection and try again.");
      } else if (err.message?.includes("status")) {
        setError("Server error. Please try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText1("");
    setText2("");
    setResult(null);
    setIsChallengeMode(false);
    setGauntletSent(false);
    setActiveLink(null);
    setShowShareHub(false);
  };

  const handleDropTake = async () => {
    if (!text1.trim()) {
      setError("Please fill in Perspective to drop your take.");
      return;
    }
    
    try {
      const payload = window.btoa(JSON.stringify({ 
        mode, 
        p1Arg: text1 
      }));
      const link = `${window.location.origin}${window.location.pathname}?data=${payload}`;
      
      setActiveLink(link);
      setShowShareHub(true);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Failed to create link:", err);
      setError("Failed to create challenge link. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">DropTake</h1>
          {!isChallengeMode ? (
            <div className="space-y-2">
              <button
                onClick={() =>
                  setMode((prev) => (prev === "petty" ? "productive" : "petty"))
                }
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${accent} shadow-lg transition`}
              >
                <span className="h-2 w-2 rounded-full bg-white" />
                {modeLabel}
              </button>
              <p className={`text-sm font-semibold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
                {modeTagline}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm font-semibold bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
                {modeLabel}: {modeTagline}
              </p>
            </div>
          )}
        </div>

        {/* Challenge Mode: Show P1 Card */}
        {isChallengeMode && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-2">Challenge Received</p>
            <div className="space-y-2">
              <p className="text-white/80 text-sm">{text1}</p>
            </div>
          </div>
        )}

        {/* Share Hub */}
        {showShareHub && activeLink && (
          <ShareHub
            activeLink={activeLink}
            name="Anonymous"
            argument={text1}
            onClose={() => {
              setShowShareHub(false);
              setActiveLink(null);
            }}
          />
        )}

        {/* Input Fields */}
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur space-y-4">
          {!isChallengeMode && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-white/60">
                Perspective {text1.length > MAX_LENGTH && (
                  <span className="text-red-400">({text1.length}/{MAX_LENGTH})</span>
                )}
              </label>
              <textarea
                value={text1}
                onChange={(e) => {
                  const sanitized = validateInputLength(e.target.value, MAX_LENGTH);
                  setText1(sanitized);
                }}
                placeholder="Your argument..."
                rows={4}
                maxLength={MAX_LENGTH}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              />
            </div>
          )}

          {isChallengeMode && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-white/60">
                Your Rebuttal {text2.length > MAX_LENGTH && (
                  <span className="text-red-400">({text2.length}/{MAX_LENGTH})</span>
                )}
              </label>
              <textarea
                value={text2}
                onChange={(e) => {
                  const sanitized = validateInputLength(e.target.value, MAX_LENGTH);
                  setText2(sanitized);
                }}
                placeholder="Your rebuttal..."
                rows={4}
                maxLength={MAX_LENGTH}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              />
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={isChallengeMode ? handleAnalyze : handleDropTake}
            disabled={isChallengeMode ? disableAnalyze : (!text1.trim() || loading)}
            className={`w-full rounded-xl px-6 py-4 font-bold text-white bg-gradient-to-r ${accent} shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl text-lg`}
          >
            {loading 
              ? "Analyzing..." 
              : isChallengeMode 
                ? "Rebut & Score Aura" 
                : "Drop your Take"
            }
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Results */}
        {result && mode === "petty" && (
          <PettyResultCard
            result={{
              winner: result.winner,
              score: result.score || `${result.winnerScore}-${result.loserScore}`,
              fallacy: result.fatalFlaw || result.fallacy,
              roast: result.roast || result.analysis,
              aura: result.aura,
              cringe: result.cringe,
              skill_issue: result.skill_issue,
              rawResponse: result.rawResponse
            }}
            person1Name={result.person1Name}
            person2Name={result.person2Name}
            mode={mode}
          />
        )}
        
        {result && mode === "productive" && (
          <PettyResultCard
            result={{
              alignment: result.alignment,
              friction: result.friction,
              comm_block: result.comm_block,
              insight: result.insight,
              rawResponse: result.rawResponse
            }}
            person1Name={result.person1Name}
            person2Name={result.person2Name}
            mode={mode}
          />
        )}

        {result && (
          <>
            {mode === "petty" && <SocialShareBar result={result} mode={mode} />}
            {mode === "productive" && <ExportBar result={result} mode={mode} />}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

