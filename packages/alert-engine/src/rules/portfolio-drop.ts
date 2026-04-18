import { AlertEvent, AlertSeverity, AlertType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { AlertContext } from '../types';

export function portfolioDropEvaluator(context: AlertContext): AlertEvent[] {
  const rules = context.rules.filter((r) => r.type === AlertType.PortfolioDrop && r.enabled);
  if (rules.length === 0 || !context.previousSnapshot) return [];

  const prev = context.previousSnapshot.totalUsdValue;
  const curr = context.currentSnapshot.totalUsdValue;
  if (prev === 0) return [];

  const dropPct = ((prev - curr) / prev) * 100;
  if (dropPct <= 0) return [];

  const events: AlertEvent[] = [];

  for (const rule of rules) {
    if (dropPct < rule.threshold) continue;

    const severity =
      dropPct >= 30
        ? AlertSeverity.Critical
        : dropPct >= 15
          ? AlertSeverity.High
          : AlertSeverity.Medium;

    events.push({
      id: randomUUID(),
      walletAddress: context.walletAddress,
      ruleId: rule.id,
      message: `Portfolio value dropped ${dropPct.toFixed(1)}% from $${prev.toFixed(2)} to $${curr.toFixed(2)}, exceeding ${rule.threshold}% threshold`,
      severity,
      createdAt: new Date(),
    });
  }

  return events;
}
