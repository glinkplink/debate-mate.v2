import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import PerspectiveCard from "./PerspectiveCard";

export default function ShareHub({ activeLink, name, argument, onClose }) {
  const perspectiveCardRef = useRef(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeLink);
      setStatusMessage("Link copied to clipboard!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setStatusMessage("Failed to copy link. Please try again.");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleInstagram = async () => {
    try {
      // Copy link to clipboard
      await navigator.clipboard.writeText(activeLink);
      
      // Generate the Perspective Card image
      if (!perspectiveCardRef.current) {
        setStatusMessage("Error: Could not generate image.");
        setTimeout(() => setStatusMessage(""), 3000);
        return;
      }

      // Temporarily make the card visible for html2canvas (but keep it off-screen)
      const cardElement = perspectiveCardRef.current;
      const originalStyle = {
        position: cardElement.style.position,
        left: cardElement.style.left,
        top: cardElement.style.top,
        opacity: cardElement.style.opacity,
        visibility: cardElement.style.visibility,
        pointerEvents: cardElement.style.pointerEvents,
      };

      // Make it visible but still off-screen for capture
      cardElement.style.position = "fixed";
      cardElement.style.left = "0px";
      cardElement.style.top = "0px";
      cardElement.style.opacity = "1";
      cardElement.style.visibility = "visible";
      cardElement.style.pointerEvents = "none";
      cardElement.style.zIndex = "-1";

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const canvas = await html2canvas(cardElement, {
          backgroundColor: "#000000",
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          width: cardElement.offsetWidth,
          height: cardElement.offsetHeight,
        });

        // Restore original styles
        Object.keys(originalStyle).forEach(key => {
          if (originalStyle[key]) {
            cardElement.style[key] = originalStyle[key];
          } else {
            cardElement.style[key] = "";
          }
        });

        // Download the image
        const link = document.createElement("a");
        link.download = `drop-take-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        setStatusMessage("Image saved. Use Link Sticker in Stories.");
        setTimeout(() => setStatusMessage(""), 5000);
      } catch (canvasError) {
        // Restore original styles on error
        Object.keys(originalStyle).forEach(key => {
          if (originalStyle[key]) {
            cardElement.style[key] = originalStyle[key];
          } else {
            cardElement.style[key] = "";
          }
        });
        throw canvasError;
      }
    } catch (error) {
      console.error("Failed to generate Instagram Story:", error);
      setStatusMessage(`Failed to generate image: ${error.message || "Unknown error"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };


  const handleX = async () => {
    try {
      // Generate the Perspective Card image
      if (!perspectiveCardRef.current) {
        setStatusMessage("Error: Could not generate image.");
        setTimeout(() => setStatusMessage(""), 3000);
        return;
      }

      // Temporarily make the card visible for html2canvas (but keep it off-screen)
      const cardElement = perspectiveCardRef.current;
      const originalStyle = {
        position: cardElement.style.position,
        left: cardElement.style.left,
        top: cardElement.style.top,
        opacity: cardElement.style.opacity,
        visibility: cardElement.style.visibility,
        pointerEvents: cardElement.style.pointerEvents,
      };

      // Make it visible but still off-screen for capture
      cardElement.style.position = "fixed";
      cardElement.style.left = "0px";
      cardElement.style.top = "0px";
      cardElement.style.opacity = "1";
      cardElement.style.visibility = "visible";
      cardElement.style.pointerEvents = "none";
      cardElement.style.zIndex = "-1";

      // Wait a bit for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const canvas = await html2canvas(cardElement, {
          backgroundColor: "#000000",
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          width: cardElement.offsetWidth,
          height: cardElement.offsetHeight,
        });

        // Restore original styles
        Object.keys(originalStyle).forEach(key => {
          if (originalStyle[key]) {
            cardElement.style[key] = originalStyle[key];
          } else {
            cardElement.style[key] = "";
          }
        });

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setStatusMessage("Failed to generate image blob.");
            setTimeout(() => setStatusMessage(""), 3000);
            return;
          }

          // Create a File object
          const file = new File([blob], `drop-take-${Date.now()}.png`, { type: "image/png" });

          // Try Web Share API with files (if supported)
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              const text = `You disagree? Say it with your chest. ${activeLink} #AuraWars #DropTake`;
              await navigator.share({
                text: text,
                files: [file],
                title: "DropTake",
              });
              setStatusMessage("Shared successfully!");
              setTimeout(() => setStatusMessage(""), 3000);
              return;
            } catch (shareError) {
              // If share fails, fall back to Twitter intent
              console.log("Web Share failed, falling back to Twitter intent:", shareError);
            }
          }

          // Fallback: Download image and open Twitter with text
          const link = document.createElement("a");
          link.download = `drop-take-${Date.now()}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);

          const text = `You disagree? Say it with your chest. ${activeLink} #AuraWars #DropTake`;
          const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          window.open(url, "_blank", "width=550,height=420");
          
          setStatusMessage("Image downloaded! Attach it to your tweet.");
          setTimeout(() => setStatusMessage(""), 5000);
        }, "image/png");
      } catch (canvasError) {
        // Restore original styles on error
        Object.keys(originalStyle).forEach(key => {
          if (originalStyle[key]) {
            cardElement.style[key] = originalStyle[key];
          } else {
            cardElement.style[key] = "";
          }
        });
        throw canvasError;
      }
    } catch (error) {
      console.error("Failed to generate X post:", error);
      setStatusMessage(`Failed to generate image: ${error.message || "Unknown error"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Perspective Card for export */}
      <div className="fixed left-0 top-0 w-[405px] h-[720px] opacity-0 pointer-events-none" style={{ zIndex: -1, visibility: "hidden" }}>
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

        {statusMessage && (
          <div className="mb-4 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200 text-center">
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Instagram Button */}
          <button
            onClick={handleInstagram}
            className="w-full rounded-xl px-4 py-4 font-bold text-white shadow-lg transition hover:shadow-xl transform hover:scale-105"
            style={{ backgroundColor: "#E1306C" }}
          >
            📸 Instagram
          </button>

          {/* X Button */}
          <button
            onClick={handleX}
            className="w-full rounded-xl px-4 py-4 font-bold text-white shadow-lg transition hover:shadow-xl transform hover:scale-105"
            style={{ backgroundColor: "#000000" }}
          >
            🐦 X
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-full rounded-xl px-4 py-4 font-bold text-white bg-gradient-to-r from-pink-500 to-orange-500 shadow-lg transition hover:shadow-xl transform hover:scale-105"
          >
            📋 Copy Link
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
