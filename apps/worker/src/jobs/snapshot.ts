import { PrismaClient } from '@prisma/client';
import { PortfolioProvider } from '@defi-copilot/domain';

export async function processSnapshot(
  walletAddress: string,
  provider: PortfolioProvider,
  prisma: PrismaClient,
) {
  const [balances, positions] = await Promise.all([
    provider.getBalances(walletAddress),
    provider.getPositions(walletAddress),
  ]);

  const totalUsdValue = balances.reduce((sum, b) => sum + b.usdValue, 0);

  const snapshot = await prisma.portfolioSnapshot.create({
    data: { walletAddress, totalUsdValue },
  });

  await prisma.assetBalance.deleteMany({ where: { walletAddress } });
  await prisma.assetBalance.createMany({
    data: balances.map((b) => ({
      walletAddress: b.walletAddress,
      chainId: b.chainId,
      tokenSymbol: b.tokenSymbol,
      tokenAddress: b.tokenAddress,
      amount: b.amount,
      usdValue: b.usdValue,
    })),
  });

  await prisma.protocolPosition.deleteMany({ where: { walletAddress } });
  await prisma.protocolPosition.createMany({
    data: positions.map((p) => ({
      id: p.id,
      walletAddress: p.walletAddress,
      chainId: p.chainId,
      protocol: p.protocol,
      positionType: p.positionType,
      assetSymbols: p.assetSymbols,
      usdValue: p.usdValue,
      debtUsd: p.debtUsd,
      apy: p.apy,
      rewardsUsd: p.rewardsUsd,
      healthFactor: p.healthFactor,
      riskScore: p.riskScore,
      metadata: p.metadata ? JSON.parse(JSON.stringify(p.metadata)) : undefined,
      updatedAt: p.updatedAt,
    })),
  });

  console.log(`[snapshot] ${walletAddress}: $${totalUsdValue.toFixed(2)}, ${balances.length} balances, ${positions.length} positions`);

  return { snapshot, balances, positions };
}
