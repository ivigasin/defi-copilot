import { Recommendation, RecommendationType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { PortfolioData } from '../types';

const REWARDS_THRESHOLD_USD = 50;

export function unclaimedRewardsRule(data: PortfolioData): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const pos of data.positions) {
    if (pos.rewardsUsd === undefined || pos.rewardsUsd === null) continue;
    if (pos.rewardsUsd <= REWARDS_THRESHOLD_USD) continue;

    recommendations.push({
      id: randomUUID(),
      walletAddress: data.walletAddress,
      type: RecommendationType.UnclaimedRewards,
      title: `Unclaimed rewards on ${pos.protocol}`,
      summary: `You have $${pos.rewardsUsd.toFixed(2)} in unclaimed rewards on ${pos.protocol}. Consider claiming and reinvesting them to compound your yield.`,
      rationale: [
        `$${pos.rewardsUsd.toFixed(2)} in unclaimed rewards exceeds the $${REWARDS_THRESHOLD_USD} threshold`,
        `Rewards are from your ${pos.positionType.toLowerCase()} position in ${pos.assetSymbols.join(', ')}`,
        'Unclaimed rewards do not earn additional yield and are exposed to token price risk',
      ],
      confidence: 0.9,
      expectedImpactUsd: pos.rewardsUsd,
      createdAt: new Date(),
    });
  }

  return recommendations;
}
