'use client';

import { useWallet } from '@/lib/wallet-context';
import { useRecommendations } from '@/lib/hooks';

const CONFIDENCE_COLOR: Record<string, string> = {
  high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

function confidenceLevel(c: number) {
  if (c >= 0.8) return 'high';
  if (c >= 0.5) return 'medium';
  return 'low';
}

export function RecommendationList() {
  const { address } = useWallet();
  const { data: recs, isLoading, error } = useRecommendations(address);

  if (!address) return <p className="text-zinc-500">Connect a wallet to view recommendations.</p>;
  if (isLoading) return <p className="text-zinc-500">Loading recommendations...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!recs || recs.length === 0) return <p className="text-zinc-500">No recommendations at this time.</p>;

  return (
    <div className="space-y-4">
      {recs.map((rec) => {
        const level = confidenceLevel(rec.confidence);
        return (
          <div key={rec.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold">{rec.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${CONFIDENCE_COLOR[level]}`}>
                {(rec.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{rec.summary}</p>
            <div className="space-y-1">
              {rec.rationale.map((r, i) => (
                <p key={i} className="text-xs text-zinc-500 pl-3 border-l-2 border-zinc-200 dark:border-zinc-700">
                  {r}
                </p>
              ))}
            </div>
            {rec.expectedImpactUsd !== null && (
              <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
                Potential impact: ${rec.expectedImpactUsd.toFixed(2)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
