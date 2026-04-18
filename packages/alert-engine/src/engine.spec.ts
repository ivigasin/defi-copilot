import { AlertType, AlertSeverity, PositionType } from '@defi-copilot/domain';
import { evaluateAlerts } from './engine';
import { AlertContext } from './types';

const ADDR = '0x0000000000000000000000000000000000000001';

function makeContext(overrides?: Partial<AlertContext>): AlertContext {
  return {
    walletAddress: ADDR,
    rules: [
      { id: 'r1', walletAddress: ADDR, type: AlertType.HealthFactor, threshold: 1.5, enabled: true },
      { id: 'r2', walletAddress: ADDR, type: AlertType.PortfolioDrop, threshold: 10, enabled: true },
      { id: 'r3', walletAddress: ADDR, type: AlertType.YieldDrop, threshold: 2, enabled: true },
      { id: 'r4', walletAddress: ADDR, type: AlertType.LargeBalanceChange, threshold: 20, enabled: true },
    ],
    balances: [
      { walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 2, usdValue: 6000 },
    ],
    positions: [
      { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.1, apy: 4.5, updatedAt: new Date() },
    ],
    currentSnapshot: { walletAddress: ADDR, totalUsdValue: 6000, timestamp: new Date() },
    previousSnapshot: { walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() },
    previousBalances: [
      { walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 },
    ],
    ...overrides,
  };
}

describe('evaluateAlerts (engine)', () => {
  it('runs all evaluators and returns combined events', () => {
    const events = evaluateAlerts(makeContext());
    // health factor (1.1 < 1.5), portfolio drop (40%), large balance change (33%)
    expect(events.length).toBeGreaterThanOrEqual(3);

    for (const event of events) {
      expect(event.walletAddress).toBe(ADDR);
      expect(event.id).toBeDefined();
      expect(event.message).toBeTruthy();
      expect(Object.values(AlertSeverity)).toContain(event.severity);
    }
  });

  it('returns empty with no rules', () => {
    const events = evaluateAlerts(makeContext({ rules: [] }));
    expect(events).toEqual([]);
  });

  it('returns empty with no triggering conditions', () => {
    const events = evaluateAlerts(makeContext({
      positions: [],
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 }],
      previousBalances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 }],
      currentSnapshot: { walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() },
      previousSnapshot: { walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() },
    }));
    expect(events).toEqual([]);
  });

  it('accepts custom evaluator set', () => {
    const custom = () => [];
    const events = evaluateAlerts(makeContext(), [custom]);
    expect(events).toEqual([]);
  });
});
