import { Recommendation, RecommendationType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { PortfolioData } from '../types';

const STABLECOINS = new Set(['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FRAX', 'LUSD']);
const APY_THRESHOLD = 2; // 2%

export function lowYieldRule(data: PortfolioData): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const pos of data.positions) {
    if (pos.apy === undefined || pos.apy === null) continue;
    if (pos.apy >= APY_THRESHOLD) continue;

    // Only flag stablecoin positions
    const isStablecoinPosition = pos.assetSymbols.some((s) => STABLECOINS.has(s.toUpperCase()));
    if (!isStablecoinPosition) continue;

    recommendations.push({
      id: randomUUID(),
      walletAddress: data.walletAddress,
      type: RecommendationType.LowYield,
      title: `Low yield on ${pos.protocol} ${pos.assetSymbols.join('/')} position`,
      summary: `Your ${pos.assetSymbols.join('/')} position on ${pos.protocol} is earning only ${pos.apy.toFixed(2)}% APY. Consider moving to a higher-yield opportunity.`,
      rationale: [
        `Current APY of ${pos.apy.toFixed(2)}% is below the ${APY_THRESHOLD}% minimum for stablecoin positions`,
        `Position in ${pos.assetSymbols.join(', ')} on ${pos.protocol} worth $${pos.usdValue.toFixed(2)}`,
        'Stablecoin positions should target at least 2% APY to justify the smart contract risk',
      ],
      confidence: 0.7,
      expectedImpactUsd: pos.usdValue * ((APY_THRESHOLD - pos.apy) / 100),
      createdAt: new Date(),
    });
  }

  return recommendations;
}
