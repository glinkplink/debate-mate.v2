import React, { useRef } from "react";
import html2canvas from "html2canvas";

export default function PettyResultCard({ result, person1Name, person2Name }) {
  const cardRef = useRef(null);

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

  const scores = parseScore(result?.score);
  const winner = result?.winner || person1Name || "Person 1";
  const fallacy = result?.fallacy || "Logical Fallacy";
  const roast = result?.roast || "No analysis provided.";

  return (
    <div className="mt-6 space-y-4">
      {/* Card for display and download */}
      <div
        ref={cardRef}
        className="relative rounded-3xl bg-gradient-to-br from-orange-400 via-pink-500 to-orange-600 p-8 shadow-2xl"
        style={{ minHeight: "500px" }}
      >
        {/* Top Section - Winner and Score */}
        <div className="text-center mb-6">
          <p className="text-orange-100 text-sm uppercase tracking-widest font-bold mb-2">
            Winner
          </p>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-lg">
            {winner}
          </h1>
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-3xl md:text-4xl font-bold text-white">
              {scores.winner}-{scores.loser}
            </span>
          </div>
        </div>

        {/* Middle Section - Fatal Flaw Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-orange-500 rounded-full px-6 py-3 shadow-lg transform hover:scale-105 transition-transform">
            <p className="text-white font-bold text-lg md:text-xl uppercase tracking-wide">
              ⚠️ Fatal Flaw: {fallacy}
            </p>
          </div>
        </div>

        {/* Bottom Section - Savage Roast */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-white text-lg md:text-xl italic leading-relaxed text-center font-medium">
            "{roast}"
          </p>
        </div>

        {/* Footer - Branding */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <p className="text-orange-100 text-sm font-semibold">
            DebateMate.ai
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality - can be enhanced later
              if (navigator.share) {
                navigator.share({
                  title: `${winner} Wins!`,
                  text: `Check out this savage debate result on DebateMate.ai`,
                  url: window.location.href
                });
              } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-full transition-all backdrop-blur-sm"
          >
            Share to Settle
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

