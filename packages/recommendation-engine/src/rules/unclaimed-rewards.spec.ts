import { RecommendationType, PositionType } from '@defi-copilot/domain';
import { unclaimedRewardsRule } from './unclaimed-rewards';
import { PortfolioData } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';

function makeData(overrides?: Partial<PortfolioData>): PortfolioData {
  return { walletAddress: ADDR, balances: [], positions: [], ...overrides };
}

describe('unclaimedRewardsRule', () => {
  it('returns empty when no positions have rewards', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Lido', positionType: PositionType.Staking, assetSymbols: ['stETH'], usdValue: 5000, updatedAt: new Date() },
      ],
    });
    expect(unclaimedRewardsRule(data)).toEqual([]);
  });

  it('returns empty when rewards are below threshold', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, rewardsUsd: 30, updatedAt: new Date() },
      ],
    });
    expect(unclaimedRewardsRule(data)).toEqual([]);
  });

  it('returns empty at exactly $50', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, rewardsUsd: 50, updatedAt: new Date() },
      ],
    });
    expect(unclaimedRewardsRule(data)).toEqual([]);
  });

  it('triggers when rewards exceed $50', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, rewardsUsd: 65, updatedAt: new Date() },
      ],
    });
    const recs = unclaimedRewardsRule(data);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe(RecommendationType.UnclaimedRewards);
    expect(recs[0].expectedImpactUsd).toBe(65);
    expect(recs[0].confidence).toBe(0.9);
  });

  it('triggers for multiple positions with high rewards', () => {
    const data = makeData({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, rewardsUsd: 80, updatedAt: new Date() },
        { id: 'p2', walletAddress: ADDR, chainId: 1, protocol: 'Lido', positionType: PositionType.Staking, assetSymbols: ['stETH'], usdValue: 3000, rewardsUsd: 60, updatedAt: new Date() },
      ],
    });
    expect(unclaimedRewardsRule(data)).toHaveLength(2);
  });
});
