import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Zap, Brain } from 'lucide-react';
import { useDebate } from '@/hooks/useDebate';
import { type DebateMode, type DebateResult } from '@/lib/debateUtils';
import { useLocation } from 'wouter';
import ResultsScreen from '@/components/ResultsScreen';
import Confetti from '@/components/Confetti';

/**
 * Home Page - Main debate interface
 * Design: Gradient Maximalism with Playful Energy
 * - Vibrant animated gradients for mode distinction
 * - Smooth transitions and playful interactions
 * - Mobile-first responsive layout
 */
export default function Home() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<DebateMode>('petty');
  const [person1Name, setPerson1Name] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [person1Arg, setPerson1Arg] = useState('');
  const [person2Arg, setPerson2Arg] = useState('');
  const [result, setResult] = useState<DebateResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { analyze, loading, error } = useDebate();

  const handleAnalyze = async () => {
    const debateResult = await analyze(
      mode,
      person1Name,
      person1Arg,
      person2Name,
      person2Arg,
      apiKey
    );

    if (debateResult) {
      setResult(debateResult);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  };

  const handleNewDebate = () => {
    setPerson1Name('');
    setPerson2Name('');
    setPerson1Arg('');
    setPerson2Arg('');
    setResult(null);
  };

  if (result) {
    return <ResultsScreen result={result} onNewDebate={handleNewDebate} />;
  }

  const bgImage = mode === 'petty' ? '/images/hero-gradient-petty.png' : '/images/hero-gradient-productive.png';
  const modeLabel = mode === 'petty' ? '🎉 Petty Mode' : '💼 Productive Mode';
  const accentColor = mode === 'petty' ? 'from-emerald-500 to-green-600' : 'from-sky-500 to-blue-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {showConfetti && <Confetti />}

      {/* Hero Section */}
      <div
        className="relative h-64 md:h-80 bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 animate-bounce-in">
            Debate Mate
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90">
            AI-Powered Debate Analysis
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Mode Selector */}
        <Card className="mb-8 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-600">Petty Mode</span>
              </div>
              <Switch
                checked={mode === 'productive'}
                onCheckedChange={(checked) => setMode(checked ? 'productive' : 'petty')}
                className="data-[state=checked]:bg-sky-500"
              />
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-sky-500" />
                <span className="text-sm font-medium text-gray-600">Productive Mode</span>
              </div>
            </div>
            <div className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
              {modeLabel}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {mode === 'petty'
              ? '🎭 Witty, sarcastic analysis perfect for fun debates'
              : '🤝 Serious, constructive analysis for meaningful conversations'}
          </p>
        </Card>



        {/* Debate Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Person 1 */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Person 1 Name (Optional)
              </label>
              <Input
                placeholder="e.g., Sarah"
                value={person1Name}
                onChange={(e) => setPerson1Name(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Their Argument
              </label>
              <Textarea
                placeholder="Enter their perspective on the disagreement..."
                value={person1Arg}
                onChange={(e) => setPerson1Arg(e.target.value)}
                className="min-h-40 resize-none"
              />
            </div>
          </Card>

          {/* Person 2 */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Person 2 Name (Optional)
              </label>
              <Input
                placeholder="e.g., John"
                value={person2Name}
                onChange={(e) => setPerson2Name(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Their Argument
              </label>
              <Textarea
                placeholder="Enter their perspective on the disagreement..."
                value={person2Arg}
                onChange={(e) => setPerson2Arg(e.target.value)}
                className="min-h-40 resize-none"
              />
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleAnalyze}
            disabled={loading || !person1Arg.trim() || !person2Arg.trim() || !apiKey}
            className={`px-8 py-6 text-lg font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
              mode === 'petty'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
            } text-white shadow-lg`}
          >
            {loading ? 'Analyzing...' : '⚡ Analyze Debate'}
          </Button>
          <Button
            onClick={() => setLocation('/stats')}
            variant="outline"
            className="px-8 py-6 text-lg font-semibold rounded-lg"
          >
            📊 Stats
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
