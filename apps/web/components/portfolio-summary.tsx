'use client';

import { useWallet } from '@/lib/wallet-context';
import { usePortfolio } from '@/lib/hooks';

export function PortfolioSummary() {
  const { address } = useWallet();
  const { data, isLoading, error } = usePortfolio(address);

  if (!address) return <p className="text-zinc-500">Connect a wallet to view your portfolio.</p>;
  if (isLoading) return <p className="text-zinc-500">Loading portfolio...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!data) return null;

  const totalValue = data.totalUsdValue;
  const balances = data.balances;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <p className="text-sm text-zinc-500 mb-1">Total Portfolio Value</p>
        <p className="text-4xl font-bold tracking-tight">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        <p className="text-xs text-zinc-400 mt-1">Last updated: {new Date(data.timestamp).toLocaleString()}</p>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-sm font-medium text-zinc-500 mb-4">Asset Allocation</h3>
        <div className="space-y-3">
          {balances.map((b) => {
            const pct = totalValue > 0 ? (b.usdValue / totalValue) * 100 : 0;
            return (
              <div key={b.id} className="flex items-center gap-3">
                <span className="w-16 text-sm font-mono font-medium">{b.tokenSymbol}</span>
                <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-900 dark:bg-zinc-200 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-24 text-right text-sm tabular-nums">
                  ${b.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="w-14 text-right text-xs text-zinc-400 tabular-nums">{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
