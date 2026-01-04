import React, { forwardRef } from "react";

const PerspectiveCard = forwardRef(function PerspectiveCard({ name, argument, link }, ref) {
  return (
    <div
      ref={ref}
      className="relative rounded-3xl p-8 shadow-2xl mx-auto"
      style={{ 
        width: "100%",
        maxWidth: "405px",
        aspectRatio: "9 / 16",
        minHeight: "720px",
        background: "linear-gradient(to bottom right, #0f172a, #1e293b, #000000)",
        border: "1px solid rgba(236, 72, 153, 0.2)"
      }}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Top Section */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl" style={{ 
            textShadow: "0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)" 
          }}>
            {name || "Anonymous"}
          </h1>
          <p className="text-xs uppercase font-black mb-6" style={{ 
            letterSpacing: "0.3em",
            textShadow: "0 0 10px rgba(236, 72, 153, 0.5)",
            color: "#f472b6"
          }}>
            dropped a take:
          </p>
        </div>

        {/* Middle Section - Argument */}
        <div className="rounded-2xl p-8 mb-6 flex-1 flex items-center" style={{
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <p className="text-xl md:text-2xl leading-relaxed text-center font-bold" style={{ 
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            color: "#ffffff"
          }}>
            "{argument}"
          </p>
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <p className="text-sm font-bold mb-3 tracking-wide" style={{ color: "#f9a8d4" }}>
            Link in bio to rebuttal.
          </p>
          <p className="text-lg font-black tracking-wider" style={{ 
            textShadow: "0 0 10px rgba(236, 72, 153, 0.5)",
            color: "#ec4899"
          }}>
            DropTake
          </p>
        </div>
      </div>
    </div>
  );
});

export default PerspectiveCard;
