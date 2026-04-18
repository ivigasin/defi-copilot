import { AlertType, AlertSeverity, PositionType } from '@defi-copilot/domain';
import { yieldDropEvaluator } from './yield-drop';
import { AlertContext } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';
const RULE_ID = 'rule-yd-1';

function makeContext(overrides?: Partial<AlertContext>): AlertContext {
  return {
    walletAddress: ADDR,
    rules: [{ id: RULE_ID, walletAddress: ADDR, type: AlertType.YieldDrop, threshold: 2, enabled: true }],
    balances: [],
    positions: [],
    currentSnapshot: { walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() },
    ...overrides,
  };
}

describe('yieldDropEvaluator', () => {
  it('returns empty when no positions have apy', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Lido', positionType: PositionType.Staking, assetSymbols: ['stETH'], usdValue: 5000, updatedAt: new Date() },
      ],
    });
    expect(yieldDropEvaluator(ctx)).toEqual([]);
  });

  it('returns empty when apy is above threshold', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, apy: 3.5, updatedAt: new Date() },
      ],
    });
    expect(yieldDropEvaluator(ctx)).toEqual([]);
  });

  it('triggers when apy drops below threshold', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, apy: 1.2, updatedAt: new Date() },
      ],
    });
    const events = yieldDropEvaluator(ctx);
    expect(events).toHaveLength(1);
    expect(events[0].severity).toBe(AlertSeverity.Medium);
    expect(events[0].message).toContain('1.20%');
  });

  it('assigns High severity for very low apy', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, apy: 0.3, updatedAt: new Date() },
      ],
    });
    expect(yieldDropEvaluator(ctx)[0].severity).toBe(AlertSeverity.High);
  });

  it('returns empty when rule is disabled', () => {
    const ctx = makeContext({
      rules: [{ id: RULE_ID, walletAddress: ADDR, type: AlertType.YieldDrop, threshold: 2, enabled: false }],
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Lending, assetSymbols: ['USDC'], usdValue: 5000, apy: 0.5, updatedAt: new Date() },
      ],
    });
    expect(yieldDropEvaluator(ctx)).toEqual([]);
  });
});
