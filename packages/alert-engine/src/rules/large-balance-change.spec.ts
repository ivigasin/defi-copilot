import { AlertType, AlertSeverity } from '@defi-copilot/domain';
import { largeBalanceChangeEvaluator } from './large-balance-change';
import { AlertContext } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';
const RULE_ID = 'rule-lbc-1';

function makeContext(overrides?: Partial<AlertContext>): AlertContext {
  return {
    walletAddress: ADDR,
    rules: [{ id: RULE_ID, walletAddress: ADDR, type: AlertType.LargeBalanceChange, threshold: 20, enabled: true }],
    balances: [
      { walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 2, usdValue: 6000 },
    ],
    previousBalances: [
      { walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 },
    ],
    positions: [],
    currentSnapshot: { walletAddress: ADDR, totalUsdValue: 6000, timestamp: new Date() },
    ...overrides,
  };
}

describe('largeBalanceChangeEvaluator', () => {
  it('returns empty when no previous balances', () => {
    const ctx = makeContext({ previousBalances: undefined });
    expect(largeBalanceChangeEvaluator(ctx)).toEqual([]);
  });

  it('returns empty when change is below threshold', () => {
    const ctx = makeContext({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 2.8, usdValue: 8500 }],
      previousBalances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 }],
    });
    // ~5.6% change
    expect(largeBalanceChangeEvaluator(ctx)).toEqual([]);
  });

  it('triggers on large decrease', () => {
    // 9000 → 6000 = 33.3% change
    const events = largeBalanceChangeEvaluator(makeContext());
    expect(events).toHaveLength(1);
    expect(events[0].message).toContain('decreased');
    expect(events[0].message).toContain('ETH');
    expect(events[0].severity).toBe(AlertSeverity.Medium);
  });

  it('assigns High severity for 50%+ change', () => {
    const ctx = makeContext({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 1, usdValue: 3000 }],
      previousBalances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 }],
    });
    // 66.7% change
    expect(largeBalanceChangeEvaluator(ctx)[0].severity).toBe(AlertSeverity.High);
  });

  it('triggers on large increase', () => {
    const ctx = makeContext({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 5, usdValue: 15000 }],
      previousBalances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 }],
    });
    const events = largeBalanceChangeEvaluator(ctx);
    expect(events).toHaveLength(1);
    expect(events[0].message).toContain('increased');
  });

  it('assigns Medium severity for moderate change', () => {
    const ctx = makeContext({
      balances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 2.4, usdValue: 7200 }],
      previousBalances: [{ walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 }],
    });
    // 20% change
    expect(largeBalanceChangeEvaluator(ctx)[0].severity).toBe(AlertSeverity.Medium);
  });

  it('handles new token appearing', () => {
    const ctx = makeContext({
      balances: [
        { walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 },
        { walletAddress: ADDR, chainId: 1, tokenSymbol: 'USDC', amount: 5000, usdValue: 5000 },
      ],
      previousBalances: [
        { walletAddress: ADDR, chainId: 1, tokenSymbol: 'ETH', amount: 3, usdValue: 9000 },
      ],
    });
    // USDC went from 0 to 5000, 100% change
    const events = largeBalanceChangeEvaluator(ctx);
    expect(events.some((e) => e.message.includes('USDC'))).toBe(true);
  });

  it('returns empty when rule is disabled', () => {
    const ctx = makeContext({
      rules: [{ id: RULE_ID, walletAddress: ADDR, type: AlertType.LargeBalanceChange, threshold: 20, enabled: false }],
    });
    expect(largeBalanceChangeEvaluator(ctx)).toEqual([]);
  });
});
