import { AlertEvent, AlertSeverity, AlertType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { AlertContext } from '../types';

export function healthFactorEvaluator(context: AlertContext): AlertEvent[] {
  const rules = context.rules.filter((r) => r.type === AlertType.HealthFactor && r.enabled);
  if (rules.length === 0) return [];

  const events: AlertEvent[] = [];

  for (const rule of rules) {
    for (const pos of context.positions) {
      if (pos.healthFactor === undefined || pos.healthFactor === null) continue;
      if (pos.healthFactor >= rule.threshold) continue;

      const severity =
        pos.healthFactor < 1.05
          ? AlertSeverity.Critical
          : pos.healthFactor < 1.2
            ? AlertSeverity.High
            : AlertSeverity.Medium;

      events.push({
        id: randomUUID(),
        walletAddress: context.walletAddress,
        ruleId: rule.id,
        message: `Health factor on ${pos.protocol} (${pos.assetSymbols.join('/')}) dropped to ${pos.healthFactor.toFixed(2)}, below threshold of ${rule.threshold}`,
        severity,
        createdAt: new Date(),
      });
    }
  }

  return events;
}
