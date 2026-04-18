import { PrismaClient } from '@prisma/client';
import { AssetBalance, ProtocolPosition } from '@defi-copilot/domain';
import { evaluateRecommendations } from '@defi-copilot/recommendation-engine';

export async function processRecommendations(
  walletAddress: string,
  balances: AssetBalance[],
  positions: ProtocolPosition[],
  prisma: PrismaClient,
) {
  const recommendations = evaluateRecommendations({ walletAddress, balances, positions });

  // Replace old recommendations with fresh ones
  await prisma.recommendation.deleteMany({ where: { walletAddress } });

  if (recommendations.length > 0) {
    await prisma.recommendation.createMany({
      data: recommendations.map((r) => ({
        id: r.id,
        walletAddress: r.walletAddress,
        type: r.type,
        title: r.title,
        summary: r.summary,
        rationale: r.rationale,
        confidence: r.confidence,
        expectedImpactUsd: r.expectedImpactUsd,
      })),
    });
  }

  console.log(`[recommendations] ${walletAddress}: ${recommendations.length} generated`);

  return recommendations;
}
