import { RecommendationType } from '@defi-copilot/domain';
import { evaluateRecommendations } from './engine';
import { MockPortfolioProvider } from '@defi-copilot/provider-sdk';

const ADDR = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

describe('evaluateRecommendations (engine)', () => {
  it('runs all rules and returns combined recommendations', async () => {
    const provider = new MockPortfolioProvider();
    const balances = await provider.getBalances(ADDR);
    const positions = await provider.getPositions(ADDR);

    const recs = evaluateRecommendations({ walletAddress: ADDR, balances, positions });

    expect(recs.length).toBeGreaterThan(0);
    // Every recommendation must have required fields
    for (const rec of recs) {
      expect(rec.walletAddress).toBe(ADDR);
      expect(rec.id).toBeDefined();
      expect(rec.rationale.length).toBeGreaterThanOrEqual(1);
      expect(rec.confidence).toBeGreaterThan(0);
      expect(rec.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('does not flag USDC as idle since it is deployed in Aave lending', async () => {
    const provider = new MockPortfolioProvider();
    const balances = await provider.getBalances(ADDR);
    const positions = await provider.getPositions(ADDR);

    const recs = evaluateRecommendations({ walletAddress: ADDR, balances, positions });
    const idle = recs.filter((r) => r.type === RecommendationType.IdleStablecoin);
    expect(idle).toHaveLength(0);
  });

  it('detects unclaimed Aave rewards from mock data', async () => {
    const provider = new MockPortfolioProvider();
    const balances = await provider.getBalances(ADDR);
    const positions = await provider.getPositions(ADDR);

    const recs = evaluateRecommendations({ walletAddress: ADDR, balances, positions });
    const rewards = recs.filter((r) => r.type === RecommendationType.UnclaimedRewards);
    expect(rewards).toHaveLength(1);
    expect(rewards[0].summary).toContain('Aave');
  });

  it('returns empty for empty portfolio', () => {
    const recs = evaluateRecommendations({ walletAddress: ADDR, balances: [], positions: [] });
    expect(recs).toEqual([]);
  });

  it('accepts custom rule set', () => {
    const customRule = () => [];
    const recs = evaluateRecommendations(
      { walletAddress: ADDR, balances: [], positions: [] },
      [customRule],
    );
    expect(recs).toEqual([]);
  });
});
