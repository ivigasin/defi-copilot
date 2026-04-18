import { processRecommendations } from './recommendations';
import { MockPortfolioProvider } from '@defi-copilot/provider-sdk';

const ADDR = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

function makePrisma() {
  return {
    recommendation: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  } as never;
}

describe('processRecommendations', () => {
  it('evaluates recommendations and stores them', async () => {
    const provider = new MockPortfolioProvider();
    const prisma = makePrisma();
    const balances = await provider.getBalances(ADDR);
    const positions = await provider.getPositions(ADDR);

    const recs = await processRecommendations(ADDR, balances, positions, prisma);

    // Mock data triggers unclaimed rewards on Aave ($65 > $50)
    expect(recs.length).toBeGreaterThan(0);
    expect(prisma.recommendation.deleteMany).toHaveBeenCalledWith({ where: { walletAddress: ADDR } });
    expect(prisma.recommendation.createMany).toHaveBeenCalled();
  });

  it('clears old recommendations even when none are generated', async () => {
    const prisma = makePrisma();

    const recs = await processRecommendations(ADDR, [], [], prisma);

    expect(recs).toEqual([]);
    expect(prisma.recommendation.deleteMany).toHaveBeenCalled();
    expect(prisma.recommendation.createMany).not.toHaveBeenCalled();
  });
});
