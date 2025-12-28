import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { getDebateHistory, getScoreboard, resetAllData, type DebateMode } from '@/lib/debateUtils';
import { useLocation } from 'wouter';

/**
 * Stats Page - Debate history and scoreboard
 * Design: Gradient Maximalism with Playful Energy
 * - Clean, organized display of statistics
 * - Filter by mode (Petty vs Productive)
 * - Sortable scoreboard with win records
 */
export default function Stats() {
  const [, setLocation] = useLocation();
  const [modeFilter, setModeFilter] = useState<DebateMode | 'all'>('all');
  const [searchName, setSearchName] = useState('');

  const history = useMemo(() => {
    let debates = getDebateHistory();
    if (modeFilter !== 'all') {
      debates = debates.filter((d) => d.mode === modeFilter);
    }
    return debates.slice(0, 20); // Last 20 debates
  }, [modeFilter]);

  const scoreboard = useMemo(() => {
    const scores = getScoreboard();
    return Object.entries(scores)
      .map(([name, stats]) => ({
        name,
        ...stats,
        winRate: stats.wins + stats.losses > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0,
      }))
      .sort((a, b) => b.wins - a.wins);
  }, []);

  const filteredScoreboard = useMemo(() => {
    if (!searchName) return scoreboard;
    return scoreboard.filter((entry) =>
      entry.name.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [scoreboard, searchName]);

  const totalDebates = history.length;
  const pettyDebates = getDebateHistory('petty').length;
  const productiveDebates = getDebateHistory('productive').length;

  const handleReset = () => {
    resetAllData();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Debate Stats</h1>
            <p className="text-purple-100">Track your debate history and scores</p>
          </div>
          <Button
            onClick={() => setLocation('/')}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
            <p className="text-sm font-semibold text-blue-600 mb-2">Total Debates</p>
            <p className="text-4xl font-bold text-blue-900">{totalDebates}</p>
          </Card>
          <Card className="p-6 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-500">
            <p className="text-sm font-semibold text-emerald-600 mb-2">Petty Mode</p>
            <p className="text-4xl font-bold text-emerald-900">{pettyDebates}</p>
          </Card>
          <Card className="p-6 shadow-lg bg-gradient-to-br from-sky-50 to-sky-100 border-l-4 border-sky-500">
            <p className="text-sm font-semibold text-sky-600 mb-2">Productive Mode</p>
            <p className="text-4xl font-bold text-sky-900">{productiveDebates}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scoreboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scoreboard">🏆 Scoreboard</TabsTrigger>
            <TabsTrigger value="history">📜 History</TabsTrigger>
          </TabsList>

          {/* Scoreboard Tab */}
          <TabsContent value="scoreboard">
            <Card className="p-6 shadow-lg">
              <div className="mb-6">
                <Input
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {filteredScoreboard.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Rank</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Name</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Wins</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Losses</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Win Rate</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScoreboard.map((entry, index) => (
                        <tr key={entry.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-lg text-purple-600">#{index + 1}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{entry.name}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                              {entry.wins}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                              {entry.losses}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">
                            {entry.winRate}%
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-purple-600">
                            {entry.totalScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No debates found</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              {/* Mode Filter */}
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={() => setModeFilter('all')}
                  variant={modeFilter === 'all' ? 'default' : 'outline'}
                  className="rounded-full"
                >
                  All Debates
                </Button>
                <Button
                  onClick={() => setModeFilter('petty')}
                  variant={modeFilter === 'petty' ? 'default' : 'outline'}
                  className="rounded-full"
                >
                  🎉 Petty
                </Button>
                <Button
                  onClick={() => setModeFilter('productive')}
                  variant={modeFilter === 'productive' ? 'default' : 'outline'}
                  className="rounded-full"
                >
                  💼 Productive
                </Button>
              </div>

              {history.length > 0 ? (
                history.map((debate) => (
                  <Card key={debate.id} className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {debate.winner} vs {debate.person1Name === debate.winner ? debate.person2Name : debate.person1Name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            debate.mode === 'petty'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}>
                            {debate.mode === 'petty' ? '🎉 Petty' : '💼 Productive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(debate.timestamp).toLocaleDateString()} at {new Date(debate.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{debate.winnerScore}/10</p>
                        <p className="text-sm text-gray-500">vs {debate.loserScore}/10</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 italic">&quot;{debate.analysis}&quot;</p>

                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-gray-600 hover:text-gray-900">
                        View Arguments
                      </summary>
                      <div className="mt-4 space-y-3 text-gray-600">
                        <div>
                          <p className="font-semibold text-gray-900">{debate.person1Name}</p>
                          <p className="text-sm">{debate.person1Argument}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{debate.person2Name}</p>
                          <p className="text-sm">{debate.person2Argument}</p>
                        </div>
                      </div>
                    </details>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center shadow-lg">
                  <p className="text-gray-500 text-lg mb-4">No debates yet</p>
                  <Button onClick={() => setLocation('/')} className="bg-purple-600 hover:bg-purple-700">
                    Start a Debate
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Reset Button */}
        <div className="mt-12 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all debate history and scoreboard data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                  Reset
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
