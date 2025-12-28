import { useState, useCallback } from 'react';
import { analyzeDebate } from '@/lib/aiService';
import { saveDebateResult, parseAIResponse, type DebateMode, type DebateResult } from '@/lib/debateUtils';

export function useDebate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (
      mode: DebateMode,
      person1Name: string,
      person1Argument: string,
      person2Name: string,
      person2Argument: string,
      apiKey: string
    ): Promise<DebateResult | null> => {
      setLoading(true);
      setError(null);

      try {
        if (!person1Argument.trim() || !person2Argument.trim()) {
          throw new Error('Both arguments are required');
        }

        if (!apiKey) {
          throw new Error(`${mode === 'petty' ? 'Grok' : 'Claude'} API key is required`);
        }

        const response = await analyzeDebate(
          mode,
          person1Name || 'Person A',
          person1Argument,
          person2Name || 'Person B',
          person2Argument,
          apiKey
        );

        const parsed = parseAIResponse(response);
        if (!parsed) {
          throw new Error('Failed to parse AI response');
        }

        const result: DebateResult = {
          id: `debate-${Date.now()}`,
          mode,
          person1Name: person1Name || 'Person A',
          person2Name: person2Name || 'Person B',
          person1Argument,
          person2Argument,
          winner: parsed.winner,
          winnerScore: parsed.scores[0],
          loserScore: parsed.scores[1],
          analysis: parsed.analysis,
          timestamp: Date.now(),
        };

        saveDebateResult(result);
        setLoading(false);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setLoading(false);
        return null;
      }
    },
    []
  );

  return { analyze, loading, error };
}
