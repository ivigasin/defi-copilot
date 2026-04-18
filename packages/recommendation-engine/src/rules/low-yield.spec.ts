import { RecommendationType, PositionType } from '@defi-copilot/domain';
import { lowYieldRule } from './low-yield';
import { PortfolioData } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';

function makeData(overrides?: Partial<PortfolioData>): PortfolioData {
  return { walletAddress: ADDR, balances: [], positions: [], ...overrides };
}

describe('lowYieldRule', () => {
  it('returns empty when no positions', () => {
    expect(lowYieldRule(makeData())).toEqual([]);
  });

  it('returns empty for non-stablecoin positions even with low APY', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Lido', positionType: PositionType.Staking, assetSymbols: ['stETH'], usdValue: 5000, apy: 1.5, updatedAt: new Date() },
      ],
    });
    expect(lowYieldRule(data)).toEqual([]);
  });

  it('returns empty when stablecoin APY is at or above threshold', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, apy: 2.0, updatedAt: new Date() },
      ],
    });
    expect(lowYieldRule(data)).toEqual([]);
  });

  it('triggers for stablecoin position with APY below 2%', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, apy: 1.2, updatedAt: new Date() },
      ],
    });
    const recs = lowYieldRule(data);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe(RecommendationType.LowYield);
    expect(recs[0].confidence).toBe(0.7);
    expect(recs[0].expectedImpactUsd).toBeGreaterThan(0);
  });

  it('does not trigger when apy is null/undefined', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, updatedAt: new Date() },
      ],
    });
    expect(lowYieldRule(data)).toEqual([]);
  });

  it('recognises mixed-asset position if any asset is a stablecoin', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Curve', positionType: PositionType.LiquidityPool, assetSymbols: ['USDC', 'ETH'], usdValue: 8000, apy: 0.5, updatedAt: new Date() },
      ],
    });
    const recs = lowYieldRule(data);
    expect(recs).toHaveLength(1);
  });
});
