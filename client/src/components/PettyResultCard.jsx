import React, { useRef, useEffect, useMemo } from "react";
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

  // Parse scores and calculate percentages
  const { winnerName, loserName, auraPercent, cringePercent, statusTier } = useMemo(() => {
    const winner = result?.winner || person1Name || "Person 1";
    const isName1Winner = winner === (person1Name || "Person 1");
    const winnerName = winner;
    const loserName = isName1Winner ? (person2Name || "Person 2") : (person1Name || "Person 1");
    
    // Calculate percentages based on scores
    // Winner Aura % + Loser Cringe % = 100%
    const aura = result?.aura || 8;
    const cringe = result?.cringe || 6;
    const total = aura + cringe;
    
    // Calculate percentages
    const auraPercent = total > 0 ? Math.round((aura / total) * 100) : 85;
    const cringePercent = 100 - auraPercent;
    
    // Determine status tier for loser
    let statusTier = "";
    if (cringePercent > 90) {
      statusTier = "COOKED";
    } else if (cringePercent > 70) {
      statusTier = "ABSOLUTELY MID";
    }
    
    return { winnerName, loserName, auraPercent, cringePercent, statusTier };
  }, [result, person1Name, person2Name]);

  const fallacy = result?.fallacy || result?.skill_issue || result?.comm_block || "Logical Fallacy";
  const roast = result?.roast || result?.insight || "No analysis provided.";

  // Dynamic font size based on text length
  const roastFontSize = roast.length > 300 ? "text-sm" : "text-base md:text-lg";

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
        backgroundColor: "#000000",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `drop-take-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

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
        className={`relative rounded-3xl bg-gradient-to-br ${content.color} p-6 shadow-2xl mx-auto overflow-hidden`}
        style={{ 
          width: "100%",
          maxWidth: "405px",
          aspectRatio: "9 / 16",
          minHeight: "720px"
        }}
      >
        {/* Head-to-Head Layout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Winner Side */}
          <div className="relative text-center">
            {/* MAIN CHARACTER Badge */}
            {auraPercent > 80 && (
              <div className="absolute -top-2 -right-2 z-10 bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded-full rotate-12 shadow-lg">
                MAIN CHARACTER
              </div>
            )}
            
            <p className="text-white/90 text-xs uppercase tracking-wide font-bold mb-1">
              {winnerName}
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-3">
              <p className="text-white/80 text-xs uppercase tracking-wide font-semibold mb-1">
                AURA
              </p>
              <span className="text-4xl md:text-5xl font-black text-white block">
                {auraPercent}%
              </span>
            </div>
          </div>

          {/* VS Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30 transform -translate-x-1/2" />

          {/* Loser Side */}
          <div className="relative text-center">
            {/* Status Stamp */}
            {statusTier && (
              <div 
                className="absolute -top-2 -left-2 z-10 bg-red-600 text-white text-xs font-black px-3 py-2 rounded-lg rotate-[-12deg] shadow-2xl border-2 border-white"
                style={{ transform: "rotate(-12deg)" }}
              >
                {statusTier}
              </div>
            )}
            
            <p className="text-white/90 text-xs uppercase tracking-wide font-bold mb-1">
              {loserName}
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-3">
              <p className="text-white/80 text-xs uppercase tracking-wide font-semibold mb-1">
                CRINGE
              </p>
              <span className="text-4xl md:text-5xl font-black text-white/80 block">
                {cringePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Dominance Bar */}
        <div className="mb-4">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${content.color} transition-all duration-500`}
              style={{ width: `${auraPercent}%` }}
            />
          </div>
        </div>

        {/* SKILL ISSUE Badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-orange-500 rounded-full px-4 py-2 shadow-2xl">
            <p className="text-white font-black text-sm md:text-base uppercase tracking-wider">
              ⚠️ SKILL ISSUE: {fallacy}
            </p>
          </div>
        </div>

        {/* Roast Text with Glassmorphism */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 mb-4 flex-1 overflow-hidden">
          <p className={`text-white ${roastFontSize} italic leading-relaxed text-center font-medium`}>
            "{roast}"
          </p>
        </div>

        {/* Footer - Branding */}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <p className="text-orange-100 text-xs font-semibold">
            DropTake.ai
          </p>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const shareText = mode === "petty"
                ? `Just caught a body in AuraWars. 💀 ${winnerName} has ${auraPercent}% Aura, ${loserName} is officially ${statusTier || "cooked"}. Deal with it: ${window.location.href}`
                : `We're working on it. See our alignment report: ${window.location.href}`;
              
              if (navigator.share) {
                navigator.share({
                  title: mode === "petty" ? `${winnerName} Wins!` : "Communication Report",
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
