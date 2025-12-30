import React, { useState } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  FacebookIcon,
  TwitterIcon,
} from "react-share";

export default function SocialShareBar({ result, mode }) {
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  if (!result || mode !== "petty") return null;

  const opponentName = result.winner === result.person1Name 
    ? result.person2Name 
    : result.person1Name;

  const shareText = `AI just destroyed ${opponentName} 😂 #PettyMode debate-mate.app`;
  const shareUrl = typeof window !== "undefined" 
    ? window.location.href 
    : "https://debate-mate.app";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setShareError("Failed to copy link");
      setTimeout(() => setShareError(""), 3000);
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Debate Mate - Petty Mode",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setShareError("Share failed");
          setTimeout(() => setShareError(""), 3000);
        }
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const handleTikTok = () => {
    // TikTok doesn't have a direct share API, so we copy text for user to paste
    const tiktokText = `${shareText}\n\n${result.analysis}`;
    navigator.clipboard.writeText(tiktokText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setShareError("Failed to copy");
      setTimeout(() => setShareError(""), 3000);
    });
  };

  const handleXPost = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleWebShare}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          title="Share Roast"
        >
          📱 Share Roast
        </button>
        
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          title="Copy Link"
        >
          {copied ? "✓ Copied!" : "🔗 Copy Link"}
        </button>

        <button
          onClick={handleTikTok}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          title="Copy for TikTok"
        >
          📹 TikTok
        </button>

        <button
          onClick={handleXPost}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          title="Post on X"
        >
          🐦 X Post
        </button>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition">
          <TwitterShareButton
            url={shareUrl}
            title={shareText}
            className="flex items-center"
          >
            <TwitterIcon size={20} round />
          </TwitterShareButton>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition">
          <FacebookShareButton
            url={shareUrl}
            quote={shareText}
            className="flex items-center"
          >
            <FacebookIcon size={20} round />
          </FacebookShareButton>
        </div>
      </div>
      {shareError && (
        <p className="mt-2 text-xs text-red-400">{shareError}</p>
      )}
    </div>
  );
}

