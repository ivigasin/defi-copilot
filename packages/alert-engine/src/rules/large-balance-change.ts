import { AlertEvent, AlertSeverity, AlertType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { AlertContext } from '../types';

export function largeBalanceChangeEvaluator(context: AlertContext): AlertEvent[] {
  const rules = context.rules.filter((r) => r.type === AlertType.LargeBalanceChange && r.enabled);
  if (rules.length === 0 || !context.previousBalances) return [];

  const prevBySymbol = new Map(
    context.previousBalances.map((b) => [`${b.chainId}:${b.tokenSymbol}`, b]),
  );

  const events: AlertEvent[] = [];

  for (const rule of rules) {
    for (const curr of context.balances) {
      const key = `${curr.chainId}:${curr.tokenSymbol}`;
      const prev = prevBySymbol.get(key);
      const prevValue = prev?.usdValue ?? 0;

      if (prevValue === 0 && curr.usdValue === 0) continue;

      const reference = Math.max(prevValue, curr.usdValue);
      const changePct = (Math.abs(curr.usdValue - prevValue) / reference) * 100;

      if (changePct < rule.threshold) continue;

      const direction = curr.usdValue > prevValue ? 'increased' : 'decreased';
      const severity = changePct >= 50 ? AlertSeverity.High : AlertSeverity.Medium;

      events.push({
        id: randomUUID(),
        walletAddress: context.walletAddress,
        ruleId: rule.id,
        message: `${curr.tokenSymbol} balance ${direction} by ${changePct.toFixed(1)}% ($${prevValue.toFixed(2)} → $${curr.usdValue.toFixed(2)}), exceeding ${rule.threshold}% threshold`,
        severity,
        createdAt: new Date(),
      });
    }
  }

  return events;
}
