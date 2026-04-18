import { processSnapshot } from './snapshot';
import { MockPortfolioProvider } from '@defi-copilot/provider-sdk';

const ADDR = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

function makePrisma() {
  return {
    portfolioSnapshot: {
      create: jest.fn().mockResolvedValue({
        id: 'snap-1', walletAddress: ADDR, totalUsdValue: 12750, timestamp: new Date(),
      }),
    },
    assetBalance: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 3 }),
    },
    protocolPosition: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 3 }),
    },
  } as never;
}

describe('processSnapshot', () => {
  it('fetches balances and positions from provider', async () => {
    const provider = new MockPortfolioProvider();
    const prisma = makePrisma();

    const result = await processSnapshot(ADDR, provider, prisma);

    expect(result.balances).toHaveLength(3);
    expect(result.positions).toHaveLength(3);
    expect(result.snapshot.totalUsdValue).toBe(12750);
  });

  it('creates a portfolio snapshot in the database', async () => {
    const provider = new MockPortfolioProvider();
    const prisma = makePrisma();

    await processSnapshot(ADDR, provider, prisma);

    expect(prisma.portfolioSnapshot.create).toHaveBeenCalledWith({
      data: { walletAddress: ADDR, totalUsdValue: 12750 },
    });
  });

  it('replaces balances in the database', async () => {
    const provider = new MockPortfolioProvider();
    const prisma = makePrisma();

    await processSnapshot(ADDR, provider, prisma);

    expect(prisma.assetBalance.deleteMany).toHaveBeenCalledWith({ where: { walletAddress: ADDR } });
    expect(prisma.assetBalance.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ tokenSymbol: 'ETH' }),
        expect.objectContaining({ tokenSymbol: 'USDC' }),
        expect.objectContaining({ tokenSymbol: 'WBTC' }),
      ]),
    });
  });

  it('replaces positions in the database', async () => {
    const provider = new MockPortfolioProvider();
    const prisma = makePrisma();

    await processSnapshot(ADDR, provider, prisma);

    expect(prisma.protocolPosition.deleteMany).toHaveBeenCalledWith({ where: { walletAddress: ADDR } });
    expect(prisma.protocolPosition.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ protocol: 'Aave' }),
        expect.objectContaining({ protocol: 'Lido' }),
      ]),
    });
  });
});
