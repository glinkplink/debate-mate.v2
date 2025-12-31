import React, { forwardRef } from "react";

const PerspectiveCard = forwardRef(function PerspectiveCard({ name, argument, link }, ref) {
  return (
    <div
      ref={ref}
      className="relative rounded-3xl bg-gradient-to-br from-orange-400 to-pink-600 p-8 shadow-2xl mx-auto"
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
            {name || "Anonymous"}
          </h1>
          <p className="text-orange-100 text-sm uppercase tracking-widest font-bold mb-4">
            dropped a take:
          </p>
        </div>

        {/* Middle Section - Argument */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 flex-1 flex items-center">
          <p className="text-white text-lg md:text-xl leading-relaxed text-center font-medium">
            "{argument}"
          </p>
        </div>

        {/* Bottom Section */}
        <div className="text-center">
          <p className="text-orange-100 text-sm font-semibold mb-2">
            Link in bio to rebuttal.
          </p>
          <p className="text-orange-200 text-xs font-medium">
            DropTake.ai
          </p>
        </div>
      </div>
    </div>
  );
});

export default PerspectiveCard;
