import { Recommendation, RecommendationType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { PortfolioData } from '../types';

const CONCENTRATION_THRESHOLD = 0.5; // 50%

export function highConcentrationRule(data: PortfolioData): Recommendation[] {
  const totalUsd =
    data.balances.reduce((sum, b) => sum + b.usdValue, 0) +
    data.positions.reduce((sum, p) => sum + p.usdValue, 0);

  if (totalUsd === 0) return [];

  // Group position value by protocol
  const protocolTotals = new Map<string, number>();
  for (const pos of data.positions) {
    protocolTotals.set(pos.protocol, (protocolTotals.get(pos.protocol) ?? 0) + pos.usdValue);
  }

  const recommendations: Recommendation[] = [];

  for (const [protocol, value] of protocolTotals) {
    const pct = value / totalUsd;
    if (pct <= CONCENTRATION_THRESHOLD) continue;

    recommendations.push({
      id: randomUUID(),
      walletAddress: data.walletAddress,
      type: RecommendationType.HighConcentration,
      title: `High concentration in ${protocol}`,
      summary: `${(pct * 100).toFixed(1)}% of your portfolio ($${value.toFixed(2)}) is concentrated in ${protocol}. Consider diversifying across protocols to reduce smart contract risk.`,
      rationale: [
        `${protocol} holds $${value.toFixed(2)} out of $${totalUsd.toFixed(2)} total portfolio value`,
        `Concentration of ${(pct * 100).toFixed(1)}% exceeds the 50% threshold`,
        'Single-protocol concentration increases smart contract and counterparty risk',
      ],
      confidence: 0.75,
      createdAt: new Date(),
    });
  }

  return recommendations;
}
