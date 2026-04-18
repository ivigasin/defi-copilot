import { AlertType, AlertSeverity } from '@defi-copilot/domain';
import { portfolioDropEvaluator } from './portfolio-drop';
import { AlertContext } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';
const RULE_ID = 'rule-pd-1';

function makeContext(overrides?: Partial<AlertContext>): AlertContext {
  return {
    walletAddress: ADDR,
    rules: [{ id: RULE_ID, walletAddress: ADDR, type: AlertType.PortfolioDrop, threshold: 10, enabled: true }],
    balances: [],
    positions: [],
    currentSnapshot: { walletAddress: ADDR, totalUsdValue: 8000, timestamp: new Date() },
    previousSnapshot: { walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() },
    ...overrides,
  };
}

describe('portfolioDropEvaluator', () => {
  it('returns empty when no previous snapshot', () => {
    const ctx = makeContext({ previousSnapshot: undefined });
    expect(portfolioDropEvaluator(ctx)).toEqual([]);
  });

  it('returns empty when portfolio increased', () => {
    const ctx = makeContext({
      currentSnapshot: { walletAddress: ADDR, totalUsdValue: 12000, timestamp: new Date() },
    });
    expect(portfolioDropEvaluator(ctx)).toEqual([]);
  });

  it('returns empty when drop is below threshold', () => {
    const ctx = makeContext({
      currentSnapshot: { walletAddress: ADDR, totalUsdValue: 9500, timestamp: new Date() },
    });
    // 5% drop, threshold is 10%
    expect(portfolioDropEvaluator(ctx)).toEqual([]);
  });

  it('triggers when drop exceeds threshold', () => {
    // default: 10000 → 8000 = 20% drop, threshold 10%
    const events = portfolioDropEvaluator(makeContext());
    expect(events).toHaveLength(1);
    expect(events[0].ruleId).toBe(RULE_ID);
    expect(events[0].message).toContain('20.0%');
    expect(events[0].severity).toBe(AlertSeverity.High);
  });

  it('assigns Critical severity for 30%+ drop', () => {
    const ctx = makeContext({
      currentSnapshot: { walletAddress: ADDR, totalUsdValue: 6000, timestamp: new Date() },
    });
    expect(portfolioDropEvaluator(ctx)[0].severity).toBe(AlertSeverity.Critical);
  });

  it('assigns Medium severity for moderate drop', () => {
    const ctx = makeContext({
      currentSnapshot: { walletAddress: ADDR, totalUsdValue: 8800, timestamp: new Date() },
    });
    // 12% drop
    expect(portfolioDropEvaluator(ctx)[0].severity).toBe(AlertSeverity.Medium);
  });

  it('returns empty when previous value is zero', () => {
    const ctx = makeContext({
      previousSnapshot: { walletAddress: ADDR, totalUsdValue: 0, timestamp: new Date() },
    });
    expect(portfolioDropEvaluator(ctx)).toEqual([]);
  });
});
