import { RecommendationType, PositionType } from '@defi-copilot/domain';
import { idleStablecoinRule } from './idle-stablecoin';
import { PortfolioData } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';

function makeData(overrides?: Partial<PortfolioData>): PortfolioData {
  return { walletAddress: ADDR, balances: [], positions: [], ...overrides };
}

describe('idleStablecoinRule', () => {
  it('returns empty when no stablecoin balances', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 1, usdValue: 3000 }],
    });
    expect(idleStablecoinRule(data)).toEqual([]);
  });

  it('returns empty when stablecoin balance is below threshold', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'USDC', amount: 400, usdValue: 400 }],
    });
    expect(idleStablecoinRule(data)).toEqual([]);
  });

  it('returns empty when stablecoin is exactly at threshold', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'USDC', amount: 500, usdValue: 500 }],
    });
    expect(idleStablecoinRule(data)).toEqual([]);
  });

  it('triggers when stablecoin is above threshold and not deployed', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'USDC', amount: 1500, usdValue: 1500 }],
    });
    const recs = idleStablecoinRule(data);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe(RecommendationType.IdleStablecoin);
    expect(recs[0].rationale.length).toBeGreaterThanOrEqual(1);
    expect(recs[0].confidence).toBeGreaterThan(0);
    expect(recs[0].confidence).toBeLessThanOrEqual(1);
  });

  it('does not trigger if stablecoin is deployed in a lending position', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'USDC', amount: 1500, usdValue: 1500 }],
      positions: [
        {
          id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave',
          positionType: PositionType.Lending, assetSymbols: ['USDC'],
          usdValue: 5000, updatedAt: new Date(),
        },
      ],
    });
    expect(idleStablecoinRule(data)).toEqual([]);
  });

  it('still triggers if stablecoin is only in a borrowing position', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'DAI', amount: 1000, usdValue: 1000 }],
      positions: [
        {
          id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave',
          positionType: PositionType.Borrowing, assetSymbols: ['DAI'],
          usdValue: 2000, debtUsd: 2000, updatedAt: new Date(),
        },
      ],
    });
    const recs = idleStablecoinRule(data);
    expect(recs).toHaveLength(1);
  });

  it('triggers for multiple idle stablecoins independently', () => {
    const data = makeData({
      balances: [
        { walletAddress: ADDR, chainId: 1, tokenSymbol: 'USDC', amount: 600, usdValue: 600 },
        { walletAddress: ADDR, chainId: 1, tokenSymbol: 'DAI', amount: 800, usdValue: 800 },
      ],
    });
    const recs = idleStablecoinRule(data);
    expect(recs).toHaveLength(2);
  });

  it('includes expectedImpactUsd', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'USDC', amount: 1000, usdValue: 1000 }],
    });
    const recs = idleStablecoinRule(data);
    expect(recs[0].expectedImpactUsd).toBeGreaterThan(0);
  });
});
