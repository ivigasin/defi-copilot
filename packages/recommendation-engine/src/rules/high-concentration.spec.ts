import { RecommendationType, PositionType } from '@defi-copilot/domain';
import { highConcentrationRule } from './high-concentration';
import { PortfolioData } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';

function makeData(overrides?: Partial<PortfolioData>): PortfolioData {
  return { walletAddress: ADDR, balances: [], positions: [], ...overrides };
}

describe('highConcentrationRule', () => {
  it('returns empty when no positions', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 1, usdValue: 3000 }],
    });
    expect(highConcentrationRule(data)).toEqual([]);
  });

  it('returns empty when total value is zero', () => {
    expect(highConcentrationRule(makeData())).toEqual([]);
  });

  it('returns empty when no protocol exceeds 50%', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 5, usdValue: 10000 }],
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 3000, updatedAt: new Date() },
        { id: 'p2', walletAddress: ADDR, chainId: 1, protocol: 'Lido', positionType: PositionType.Staking, assetSymbols: ['stETH'], usdValue: 3000, updatedAt: new Date() },
      ],
    });
    expect(highConcentrationRule(data)).toEqual([]);
  });

  it('triggers when a protocol exceeds 50% of total value', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 1, usdValue: 1000 }],
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 9000, updatedAt: new Date() },
      ],
    });
    const recs = highConcentrationRule(data);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe(RecommendationType.HighConcentration);
    expect(recs[0].summary).toContain('Aave');
    expect(recs[0].confidence).toBeGreaterThan(0);
  });

  it('aggregates multiple positions of the same protocol', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 1, usdValue: 1000 }],
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 3000, updatedAt: new Date() },
        { id: 'p2', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 3000, debtUsd: 3000, updatedAt: new Date() },
      ],
    });
    // Aave total: 6000, wallet: 1000, total: 7000, Aave pct: 85.7%
    const recs = highConcentrationRule(data);
    expect(recs).toHaveLength(1);
  });

  it('does not trigger at exactly 50%', () => {
    const data = makeData({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 1, usdValue: 5000 }],
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, updatedAt: new Date() },
      ],
    });
    expect(highConcentrationRule(data)).toEqual([]);
  });
});
