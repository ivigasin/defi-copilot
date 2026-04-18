import { AlertEvent, AlertSeverity, AlertType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { AlertContext } from '../types';

export function yieldDropEvaluator(context: AlertContext): AlertEvent[] {
  const rules = context.rules.filter((r) => r.type === AlertType.YieldDrop && r.enabled);
  if (rules.length === 0) return [];

  const events: AlertEvent[] = [];

  for (const rule of rules) {
    for (const pos of context.positions) {
      if (pos.apy === undefined || pos.apy === null) continue;

      // threshold is the APY value below which we alert
      if (pos.apy >= rule.threshold) continue;

      const severity = pos.apy < 0.5 ? AlertSeverity.High : AlertSeverity.Medium;

      events.push({
        id: randomUUID(),
        walletAddress: context.walletAddress,
        ruleId: rule.id,
        message: `APY on ${pos.protocol} (${pos.assetSymbols.join('/')}) dropped to ${pos.apy.toFixed(2)}%, below threshold of ${rule.threshold}%`,
        severity,
        createdAt: new Date(),
      });
    }
  }

  return events;
}
