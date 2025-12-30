import React, { useState } from "react";

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

  const handleTikTok = async () => {
    // TikTok doesn't have a direct share API, so we copy text for user to paste
    const tiktokText = `${shareText}\n\n${result.analysis}`;
    try {
      await navigator.clipboard.writeText(tiktokText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setShareError("Failed to copy");
      setTimeout(() => setShareError(""), 3000);
    }
  };

  const handleXPost = () => {
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, "_blank", "noopener,noreferrer");
  };

  const handleFacebook = () => {
    // FacebookShareButton should handle this, but we'll ensure it works
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center gap-3">
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

        <button
          onClick={handleFacebook}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          title="Share on Facebook"
        >
          📘 Facebook
        </button>
      </div>
      {shareError && (
        <p className="mt-2 text-xs text-red-400">{shareError}</p>
      )}
    </div>
  );
}

