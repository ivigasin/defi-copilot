import { Recommendation, RecommendationType, PositionType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { PortfolioData } from '../types';

const HEALTH_FACTOR_THRESHOLD = 1.5;

export function lowHealthFactorRule(data: PortfolioData): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const pos of data.positions) {
    if (pos.healthFactor === undefined || pos.healthFactor === null) continue;
    if (pos.healthFactor >= HEALTH_FACTOR_THRESHOLD) continue;

    const severity = pos.healthFactor < 1.1 ? 'critically low' : 'low';

    recommendations.push({
      id: randomUUID(),
      walletAddress: data.walletAddress,
      type: RecommendationType.LowHealthFactor,
      title: `${severity === 'critically low' ? 'Critical: ' : ''}Low health factor on ${pos.protocol}`,
      summary: `Your ${pos.positionType.toLowerCase()} position on ${pos.protocol} has a ${severity} health factor of ${pos.healthFactor.toFixed(2)}. Consider repaying debt or adding collateral to avoid liquidation.`,
      rationale: [
        `Health factor of ${pos.healthFactor.toFixed(2)} is below the ${HEALTH_FACTOR_THRESHOLD} safety threshold`,
        `Position on ${pos.protocol} with ${pos.assetSymbols.join(', ')} worth $${pos.usdValue.toFixed(2)}`,
        pos.debtUsd ? `Outstanding debt of $${pos.debtUsd.toFixed(2)}` : 'Position has liquidation risk',
        'Liquidation can result in loss of collateral plus penalty fees',
      ],
      confidence: pos.healthFactor < 1.1 ? 0.95 : 0.9,
      createdAt: new Date(),
    });
  }

  return recommendations;
}
