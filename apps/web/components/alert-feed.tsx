'use client';

import { useWallet } from '@/lib/wallet-context';
import { useAlerts } from '@/lib/hooks';

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  LOW: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

export function AlertFeed() {
  const { address } = useWallet();
  const { data: alerts, isLoading, error } = useAlerts(address);

  if (!address) return <p className="text-zinc-500">Connect a wallet to view alerts.</p>;
  if (isLoading) return <p className="text-zinc-500">Loading alerts...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!alerts || alerts.length === 0) return <p className="text-zinc-500">No alerts triggered.</p>;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.LOW}`}>
            {alert.severity}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm">{alert.message}</p>
            <p className="text-xs text-zinc-400 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
