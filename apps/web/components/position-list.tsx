'use client';

import { useWallet } from '@/lib/wallet-context';
import { usePositions } from '@/lib/hooks';

export function PositionList() {
  const { address } = useWallet();
  const { data: positions, isLoading, error } = usePositions(address);

  if (!address) return <p className="text-zinc-500">Connect a wallet to view positions.</p>;
  if (isLoading) return <p className="text-zinc-500">Loading positions...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!positions || positions.length === 0) return <p className="text-zinc-500">No protocol positions found.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {positions.map((pos) => (
        <div key={pos.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold">{pos.protocol}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {pos.positionType.replace('_', ' ')}
              </span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              ${pos.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="text-sm text-zinc-500 space-y-1">
            <p>Assets: {pos.assetSymbols.join(', ')}</p>
            {pos.apy !== null && <p>APY: {pos.apy.toFixed(2)}%</p>}
            {pos.healthFactor !== null && (
              <p className={pos.healthFactor < 1.5 ? 'text-red-500 font-medium' : ''}>
                Health Factor: {pos.healthFactor.toFixed(2)}
              </p>
            )}
            {pos.debtUsd !== null && <p>Debt: ${pos.debtUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>}
            {pos.rewardsUsd !== null && pos.rewardsUsd > 0 && (
              <p>Rewards: ${pos.rewardsUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
