import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";

/**
 * Parses Claude response to extract Gottman Four Horsemen intensity levels
 * Converts Low/Medium/High to numerical scores (1-10)
 */
export function parseGottmanScores(claudeResponse) {
  if (!claudeResponse || typeof claudeResponse !== "string") {
    return null;
  }

  const response = claudeResponse;
  const scores = {
    user: { Criticism: 0, Contempt: 0, Defensiveness: 0, Stonewalling: 0 },
    partner: { Criticism: 0, Contempt: 0, Defensiveness: 0, Stonewalling: 0 }
  };

  // Helper to convert intensity to score
  const intensityToScore = (intensity) => {
    const lower = intensity?.toLowerCase() || "";
    if (lower.includes("high")) return 8;
    if (lower.includes("medium")) return 5;
    if (lower.includes("low")) return 2;
    return 0;
  };

  // Try to find "COMMUNICATION HEALTH SNAPSHOT" section
  const snapshotMatch = response.match(/COMMUNICATION HEALTH SNAPSHOT:?[\s\S]*?(?=THE BREAKDOWN|THE REPAIR|$)/i);
  if (snapshotMatch) {
    const snapshotText = snapshotMatch[0];
    
    // Split by participant - look for patterns
    const lines = snapshotText.split(/\n/).map(l => l.trim()).filter(Boolean);
    
    let currentPerson = null;
    const horsemen = ["Criticism", "Contempt", "Defensiveness", "Stonewalling"];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Detect which person we're looking at
      if (lowerLine.includes("person 1") || lowerLine.includes("participant 1") || lowerLine.includes("user:")) {
        currentPerson = "user";
      } else if (lowerLine.includes("person 2") || lowerLine.includes("participant 2") || lowerLine.includes("partner:")) {
        currentPerson = "partner";
      }
      
      // Extract horseman scores
      if (currentPerson) {
        horsemen.forEach((horseman) => {
          const horsemanLower = horseman.toLowerCase();
          // Look for patterns like "Criticism: High" or "Criticism - High" or "Criticism (High)"
          const regex = new RegExp(`${horsemanLower}[\\s:–-()]*(low|medium|high)`, "i");
          const match = lowerLine.match(regex);
          if (match) {
            const intensity = match[1];
            scores[currentPerson][horseman] = intensityToScore(intensity);
          }
        });
      }
    }
    
    // Fallback: if no person detected, try to extract from the whole text
    if (!currentPerson) {
      horsemen.forEach((horseman) => {
        const horsemanLower = horseman.toLowerCase();
        const regex = new RegExp(`${horsemanLower}[\\s:–-()]*(low|medium|high)`, "gi");
        const matches = snapshotText.matchAll(regex);
        let matchCount = 0;
        for (const match of matches) {
          const intensity = match[1];
          if (matchCount === 0) {
            scores.user[horseman] = intensityToScore(intensity);
          } else if (matchCount === 1) {
            scores.partner[horseman] = intensityToScore(intensity);
          }
          matchCount++;
        }
      });
    }
  }

  // If no scores found, return default structure with some values for demo
  const hasScores = Object.values(scores.user).some(v => v > 0) || Object.values(scores.partner).some(v => v > 0);
  return hasScores ? scores : null;
}

/**
 * Communication Health Radar Component
 * Displays Gottman Four Horsemen scores in a radar chart
 */
export default function CommunicationHealthRadar({ claudeResponse, person1Name = "User", person2Name = "Partner" }) {
  const gottmanScores = parseGottmanScores(claudeResponse);

  // If no scores parsed, show placeholder
  if (!gottmanScores) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Communication Health Snapshot</h3>
        <p className="text-sm text-white/60">Analysis data not available. Please try again.</p>
      </div>
    );
  }

  // Prepare data for radar chart
  const chartData = [
    { subject: "Criticism", user: gottmanScores.user.Criticism, partner: gottmanScores.partner.Criticism },
    { subject: "Contempt", user: gottmanScores.user.Contempt, partner: gottmanScores.partner.Contempt },
    { subject: "Defensiveness", user: gottmanScores.user.Defensiveness, partner: gottmanScores.partner.Defensiveness },
    { subject: "Stonewalling", user: gottmanScores.user.Stonewalling, partner: gottmanScores.partner.Stonewalling },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">Communication Health Snapshot</h3>
      <div className="w-full flex justify-center" style={{ minHeight: "300px", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="#4A90E2" strokeOpacity={0.3} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: "#E0F2FE", fontSize: 11 }}
              className="text-white/80"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]}
              tick={{ fill: "#E0F2FE", fontSize: 10 }}
              tickCount={6}
            />
            <Radar
              name={person1Name}
              dataKey="user"
              stroke="#4A90E2"
              fill="#4A90E2"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Radar
              name={person2Name}
              dataKey="partner"
              stroke="#2DD4BF"
              fill="#2DD4BF"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => <span className="text-white/80 text-xs md:text-sm">{value}</span>}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

