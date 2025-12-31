import React, { useRef } from "react";
import html2canvas from "html2canvas";
import PerspectiveCard from "./PerspectiveCard";

export default function ShareHub({ activeLink, name, argument, onClose }) {
  const perspectiveCardRef = useRef(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeLink);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Failed to copy link. Please try again.");
    }
  };

  const handleIGStory = async () => {
    try {
      // Copy link to clipboard
      await navigator.clipboard.writeText(activeLink);
      
      // Download Perspective Card
      if (perspectiveCardRef.current) {
        const canvas = await html2canvas(perspectiveCardRef.current, {
          backgroundColor: "#000000",
          scale: 2,
          useCORS: true,
          logging: false,
        });

        const link = document.createElement("a");
        link.download = `drop-take-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }
      
      alert("Link copied and card downloaded! Add to your IG Story.");
    } catch (error) {
      console.error("Failed to generate IG Story:", error);
      alert("Failed to generate IG Story. Please try again.");
    }
  };

  const handleTikTokComment = async () => {
    try {
      const text = `Challenge my take here: ${activeLink} #DropTake`;
      await navigator.clipboard.writeText(text);
      alert("TikTok comment copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy TikTok comment:", err);
      alert("Failed to copy. Please try again.");
    }
  };

  const handleXPost = () => {
    const text = `Just dropped a take on DropTake. Who's brave enough to rebuttal? ${activeLink}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  return (
    <div className="space-y-6">
      {/* Hidden Perspective Card for export */}
      <div className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
        <PerspectiveCard 
          ref={perspectiveCardRef}
          name={name} 
          argument={argument} 
          link={activeLink} 
        />
      </div>

      {/* Share Hub UI */}
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Share Hub</h2>
          <p className="text-white/70 text-sm">Spread the word and collect those rebuttals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full rounded-xl px-6 py-4 font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg transition hover:shadow-xl transform hover:scale-105"
          >
            📋 Copy Link
          </button>

          {/* IG Story Button */}
          <button
            onClick={handleIGStory}
            className="w-full rounded-xl px-6 py-4 font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transition hover:shadow-xl transform hover:scale-105"
          >
            📸 IG Story
          </button>

          {/* TikTok Comment Button */}
          <button
            onClick={handleTikTokComment}
            className="w-full rounded-xl px-6 py-4 font-bold text-white bg-gradient-to-r from-black to-gray-800 shadow-lg transition hover:shadow-xl transform hover:scale-105"
          >
            🎵 TikTok Comment
          </button>

          {/* X / Post Button */}
          <button
            onClick={handleXPost}
            className="w-full rounded-xl px-6 py-4 font-bold text-white bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg transition hover:shadow-xl transform hover:scale-105"
          >
            🐦 X / Post
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 rounded-xl px-4 py-2 border border-white/15 text-white/80 font-semibold hover:bg-white/5 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

