import React, { useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import CommunicationHealthRadar from "./CommunicationHealthRadar";

export default function PettyResultCard({ result, person1Name, person2Name, mode = "petty" }) {
  const cardRef = useRef(null);

  // Content map for conditional branding
  const contentMap = {
    petty: {
      title1: "AURA",
      title2: "CRINGE RATING",
      flawLabel: "SKILL ISSUE",
      color: "from-orange-400 to-pink-600",
      shareText: "Post Receipts"
    },
    productive: {
      title1: "ALIGNMENT",
      title2: "FRICTION",
      flawLabel: "COMMUNICATION BLOCK",
      color: "from-blue-500 to-teal-400",
      shareText: "Share Progress"
    }
  };

  const content = contentMap[mode] || contentMap.petty;

  // Trigger confetti only if winner exists
  useEffect(() => {
    if (result?.winner && mode === "petty") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result?.winner, mode]);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `debate-mate-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  // Parse score from "X-Y" format
  const parseScore = (scoreStr) => {
    if (!scoreStr) return { winner: 0, loser: 0 };
    const match = scoreStr.match(/(\d+)-(\d+)/);
    if (match) {
      return { winner: parseInt(match[1], 10), loser: parseInt(match[2], 10) };
    }
    return { winner: 0, loser: 0 };
  };

  // Parse scores - handle both old and new formats
  const scores = parseScore(result?.score || (result?.aura ? `${result.aura}-${result.cringe || 0}` : null));
  const winner = result?.winner || person1Name || "Person 1";
  const fallacy = result?.fallacy || result?.skill_issue || result?.comm_block || "Logical Fallacy";
  const roast = result?.roast || result?.insight || "No analysis provided.";
  const aura = result?.aura || scores.winner;
  const cringe = result?.cringe || scores.loser;
  const alignment = result?.alignment || scores.winner;
  const friction = result?.friction || scores.loser;

  // For productive mode, show radar chart instead
  if (mode === "productive" && result?.rawResponse) {
    return (
      <div className="mt-6 space-y-4">
        <CommunicationHealthRadar
          claudeResponse={result.rawResponse}
          person1Name={person1Name}
          person2Name={person2Name}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Card for display and download - 9:16 aspect ratio for TikTok */}
      <div
        ref={cardRef}
        className={`relative rounded-3xl bg-gradient-to-br ${content.color} p-8 shadow-2xl mx-auto`}
        style={{ 
          width: "100%",
          maxWidth: "405px", // 9:16 ratio: 405px width = 720px height
          aspectRatio: "9 / 16",
          minHeight: "720px"
        }}
      >
        {/* Top Section - Winner and Score */}
        <div className="text-center mb-6">
          <p className="text-orange-100 text-sm uppercase tracking-widest font-bold mb-2">
            Winner
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-lg">
            {winner}
          </h1>
          
          {/* Aura vs Cringe Display */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Winner's AURA */}
              <div className={`text-center ${mode === "petty" ? "animate-pulse" : ""}`}>
                <p className="text-orange-100 text-xs uppercase tracking-wide font-semibold mb-1">
                  AURA
                </p>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                  <span className="text-5xl md:text-6xl font-black text-white">
                    +{mode === "petty" ? aura : alignment}
                  </span>
                </div>
              </div>
              
              {/* VS Label */}
              <div className="flex flex-col items-center">
                <span className="text-white/60 text-lg md:text-xl font-bold italic">
                  VS
                </span>
              </div>
              
              {/* Loser's CRINGE RATING */}
              <div className={`text-center ${mode === "petty" ? "animate-bounce" : ""}`}>
                <p className="text-orange-100 text-xs uppercase tracking-wide font-semibold mb-1">
                  CRINGE RATING
                </p>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <span className="text-xl md:text-2xl font-black text-white/80">
                    {(() => {
                      const loserScore = mode === "petty" ? cringe : friction;
                      const total = (mode === "petty" ? aura : alignment) + loserScore;
                      const percentage = total > 0 ? Math.round((loserScore / total) * 100) : 0;
                      return `${percentage}%`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Dominance Meter */}
            <div className="max-w-md mx-auto">
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                {(() => {
                  const winnerScore = mode === "petty" ? aura : alignment;
                  const loserScore = mode === "petty" ? cringe : friction;
                  const total = winnerScore + loserScore;
                  const dominance = total > 0 ? (winnerScore / total) * 100 : 0;
                  return (
                    <>
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${content.color} transition-all duration-500`}
                        style={{ width: `${dominance}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/80 text-xs font-bold">
                          {Math.round(dominance)}% Dominance
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - SKILL ISSUE Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-orange-500 rounded-full px-6 py-3 shadow-2xl transform hover:scale-105 transition-transform animate-pulse">
            <p className="text-white font-black text-xl md:text-2xl uppercase tracking-wider">
              ⚠️ SKILL ISSUE: {fallacy}
            </p>
          </div>
        </div>

        {/* Bottom Section - Savage Roast */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <p className="text-white text-base md:text-lg italic leading-relaxed text-center font-medium">
            "{roast}"
          </p>
        </div>

        {/* Footer - Branding */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <p className="text-orange-100 text-xs font-semibold">
            DebateMate.ai
          </p>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const shareText = mode === "petty"
                ? `I just took ${winner}'s aura. Final verdict: ${fallacy}. See the receipts: ${window.location.href}`
                : `We're working on it. See our alignment report: ${window.location.href}`;
              
              if (navigator.share) {
                navigator.share({
                  title: mode === "petty" ? `${winner} Wins!` : "Communication Report",
                  text: shareText,
                  url: window.location.href
                });
              } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(shareText);
                alert("Link copied to clipboard!");
              }
            }}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-full transition-all backdrop-blur-sm"
          >
            {content.shareText}
          </button>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          📥 Download for TikTok
        </button>
      </div>
    </div>
  );
}

