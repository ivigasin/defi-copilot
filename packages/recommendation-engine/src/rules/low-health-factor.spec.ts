import { RecommendationType, PositionType } from '@defi-copilot/domain';
import { lowHealthFactorRule } from './low-health-factor';
import { PortfolioData } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';

function makeData(overrides?: Partial<PortfolioData>): PortfolioData {
  return { walletAddress: ADDR, balances: [], positions: [], ...overrides };
}

describe('lowHealthFactorRule', () => {
  it('returns empty when no positions have healthFactor', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Lido', positionType: PositionType.Staking, assetSymbols: ['stETH'], usdValue: 5000, updatedAt: new Date() },
      ],
    });
    expect(lowHealthFactorRule(data)).toEqual([]);
  });

  it('returns empty when healthFactor is above threshold', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 2.0, updatedAt: new Date() },
      ],
    });
    expect(lowHealthFactorRule(data)).toEqual([]);
  });

  it('returns empty at exactly 1.5', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.5, updatedAt: new Date() },
      ],
    });
    expect(lowHealthFactorRule(data)).toEqual([]);
  });

  it('triggers when healthFactor is below 1.5', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.3, updatedAt: new Date() },
      ],
    });
    const recs = lowHealthFactorRule(data);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe(RecommendationType.LowHealthFactor);
    expect(recs[0].rationale.length).toBeGreaterThanOrEqual(3);
  });

  it('has higher confidence for critically low healthFactor (< 1.1)', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.05, updatedAt: new Date() },
      ],
    });
    const recs = lowHealthFactorRule(data);
    expect(recs[0].confidence).toBe(0.95);
    expect(recs[0].title).toContain('Critical');
  });

  it('flags multiple unhealthy positions independently', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.2, updatedAt: new Date() },
        { id: 'p2', walletAddress: ADDR, chainId: 1, protocol: 'Compound', positionType: PositionType.Borrowing, assetSymbols: ['USDC'], usdValue: 1000, debtUsd: 1000, healthFactor: 1.1, updatedAt: new Date() },
      ],
    });
    expect(lowHealthFactorRule(data)).toHaveLength(2);
  });
});
