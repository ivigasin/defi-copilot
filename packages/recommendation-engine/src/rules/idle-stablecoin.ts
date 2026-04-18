import { Recommendation, RecommendationType, PositionType } from '@defi-copilot/domain';
import { randomUUID } from 'crypto';
import { PortfolioData } from '../types';

const STABLECOINS = new Set(['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FRAX', 'LUSD']);
const THRESHOLD_USD = 500;

export function idleStablecoinRule(data: PortfolioData): Recommendation[] {
  // Find stablecoin balances in wallet
  const stableBalances = data.balances.filter((b) => STABLECOINS.has(b.tokenSymbol.toUpperCase()));

  // Find stablecoins deployed in protocols (lending, LP, farming, vault)
  const deployedSymbols = new Set(
    data.positions
      .filter((p) => p.positionType !== PositionType.Borrowing)
      .flatMap((p) => p.assetSymbols.filter((s) => STABLECOINS.has(s.toUpperCase()))),
  );

  const recommendations: Recommendation[] = [];

  for (const balance of stableBalances) {
    if (deployedSymbols.has(balance.tokenSymbol)) continue;
    if (balance.usdValue <= THRESHOLD_USD) continue;

    recommendations.push({
      id: randomUUID(),
      walletAddress: data.walletAddress,
      type: RecommendationType.IdleStablecoin,
      title: `Idle ${balance.tokenSymbol} detected`,
      summary: `You have $${balance.usdValue.toFixed(2)} in ${balance.tokenSymbol} sitting idle in your wallet. Consider deploying it in a lending protocol or liquidity pool to earn yield.`,
      rationale: [
        `${balance.tokenSymbol} balance of $${balance.usdValue.toFixed(2)} exceeds the $${THRESHOLD_USD} idle threshold`,
        `${balance.tokenSymbol} is not currently deployed in any protocol position`,
        'Stablecoins can earn 2-8% APY in lending protocols like Aave or Compound',
      ],
      confidence: 0.85,
      expectedImpactUsd: balance.usdValue * 0.04, // ~4% APY estimate
      createdAt: new Date(),
    });
  }

  return recommendations;
}
