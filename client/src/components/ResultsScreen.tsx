import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Share2, Download } from 'lucide-react';
import { type DebateResult, downloadImage, generateShareableImage, getScoreboard } from '@/lib/debateUtils';
import { useState } from 'react';

interface ResultsScreenProps {
  result: DebateResult;
  onNewDebate: () => void;
}

/**
 * ResultsScreen Component
 * Design: Gradient Maximalism with Playful Energy
 * - Celebratory display with trophy icons and animations
 * - Mode-specific styling (warm for Petty, cool for Productive)
 * - Share functionality for Petty mode
 */
export default function ResultsScreen({ result, onNewDebate }: ResultsScreenProps) {
  const [sharing, setSharing] = useState(false);
  const scoreboard = getScoreboard();
  const winnerStats = scoreboard[result.winner] || { wins: 0, losses: 0 };
  const loserName = result.person1Name === result.winner ? result.person2Name : result.person1Name;
  const loserStats = scoreboard[loserName] || { wins: 0, losses: 0 };

  const isPetty = result.mode === 'petty';
  const bgGradient = isPetty
    ? 'from-amber-50 to-orange-50'
    : 'from-slate-50 to-blue-50';
  const accentColor = isPetty ? 'emerald' : 'sky';
  const trophyImage = isPetty ? '/images/trophy-icon-petty.png' : '/images/trophy-icon-productive.png';

  const handleShare = async () => {
    setSharing(true);
    try {
      const imageData = generateShareableImage(result);
      downloadImage(imageData, `debate-mate-${result.id}.png`);
    } catch (error) {
      console.error('Error generating share image:', error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Trophy Section */}
      <div className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        <div className="relative z-10 text-center animate-bounce-in">
          <img
            src={trophyImage}
            alt="Trophy"
            className="w-32 md:w-48 h-32 md:h-48 mx-auto mb-6 animate-float"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {result.winner} Wins! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            {isPetty ? 'Absolutely crushed it!' : 'Made a compelling case'}
          </p>
        </div>
      </div>

      {/* Results Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Scores */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Winner Card */}
          <Card className={`p-8 shadow-lg border-l-4 border-${accentColor}-500 bg-gradient-to-br from-white to-${accentColor}-50`}>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 mb-2">WINNER</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{result.winner}</h2>
              <div className={`text-6xl font-bold text-${accentColor}-600 mb-4`}>
                {result.winnerScore}/10
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold">{winnerStats.wins} Total Wins</p>
                <p>Win Rate: {winnerStats.wins > 0 ? Math.round((winnerStats.wins / (winnerStats.wins + winnerStats.losses)) * 100) : 0}%</p>
              </div>
            </div>
          </Card>

          {/* Loser Card */}
          <Card className="p-8 shadow-lg border-l-4 border-gray-300 bg-gradient-to-br from-white to-gray-50">
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 mb-2">OTHER ARGUMENT</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{loserName}</h2>
              <div className="text-6xl font-bold text-gray-400 mb-4">
                {result.loserScore}/10
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold">{loserStats.losses} Total Losses</p>
                <p>Record: {loserStats.wins}-{loserStats.losses}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Analysis */}
        <Card className="p-8 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            {result.analysis}
          </p>
        </Card>

        {/* Original Arguments */}
        <Card className="p-8 shadow-lg mb-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Original Arguments</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-gray-900 mb-2">{result.person1Name}</p>
              <p className="text-gray-700 italic">&quot;{result.person1Argument}&quot;</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">{result.person2Name}</p>
              <p className="text-gray-700 italic">&quot;{result.person2Argument}&quot;</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onNewDebate}
            className={`px-8 py-6 text-lg font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg`}
          >
            ⚡ New Debate
          </Button>

          {isPetty && (
            <Button
              onClick={handleShare}
              disabled={sharing}
              variant="outline"
              className="px-8 py-6 text-lg font-bold rounded-lg"
            >
              {sharing ? (
                <>
                  <Download className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Result
                </>
              )}
            </Button>
          )}

          <Button
            onClick={() => window.location.href = '/stats'}
            variant="outline"
            className="px-8 py-6 text-lg font-bold rounded-lg"
          >
            📊 View Stats
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center text-sm text-amber-900">
          ⚠️ For entertainment and self-improvement - not a substitute for therapy
        </div>
      </div>
    </div>
  );
}
