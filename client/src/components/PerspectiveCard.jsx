import React, { forwardRef } from "react";

const PerspectiveCard = forwardRef(function PerspectiveCard({ name, argument, link }, ref) {
  return (
    <div
      ref={ref}
      className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 shadow-2xl mx-auto border border-pink-500/20"
      style={{ 
        width: "100%",
        maxWidth: "405px",
        aspectRatio: "9 / 16",
        minHeight: "720px"
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
          <p className="text-pink-400 text-xs uppercase tracking-[0.3em] font-black mb-6" style={{ 
            letterSpacing: "0.3em",
            textShadow: "0 0 10px rgba(236, 72, 153, 0.5)"
          }}>
            dropped a take:
          </p>
        </div>

        {/* Middle Section - Argument */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 mb-6 flex-1 flex items-center border border-white/10">
          <p className="text-white text-xl md:text-2xl leading-relaxed text-center font-bold" style={{ 
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)"
          }}>
            "{argument}"
          </p>
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <p className="text-pink-300 text-sm font-bold mb-3 tracking-wide">
            Link in bio to rebuttal.
          </p>
          <p className="text-pink-500 text-lg font-black tracking-wider" style={{ 
            textShadow: "0 0 10px rgba(236, 72, 153, 0.5)"
          }}>
            DropTake
          </p>
        </div>
      </div>
    </div>
  );
});

export default PerspectiveCard;
