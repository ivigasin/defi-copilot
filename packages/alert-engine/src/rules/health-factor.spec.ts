import { AlertType, AlertSeverity, PositionType } from '@defi-copilot/domain';
import { healthFactorEvaluator } from './health-factor';
import { AlertContext } from '../types';

const ADDR = '0x0000000000000000000000000000000000000001';
const RULE_ID = 'rule-hf-1';

function makeContext(overrides?: Partial<AlertContext>): AlertContext {
  return {
    walletAddress: ADDR,
    rules: [{ id: RULE_ID, walletAddress: ADDR, type: AlertType.HealthFactor, threshold: 1.5, enabled: true }],
    balances: [],
    positions: [],
    currentSnapshot: { walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() },
    ...overrides,
  };
}

describe('healthFactorEvaluator', () => {
  it('returns empty when no positions have healthFactor', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Lido', positionType: PositionType.Staking, assetSymbols: ['stETH'], usdValue: 5000, updatedAt: new Date() },
      ],
    });
    expect(healthFactorEvaluator(ctx)).toEqual([]);
  });

  it('returns empty when healthFactor is above threshold', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 2.0, updatedAt: new Date() },
      ],
    });
    expect(healthFactorEvaluator(ctx)).toEqual([]);
  });

  it('returns empty when no matching rules', () => {
    const ctx = makeContext({ rules: [] });
    expect(healthFactorEvaluator(ctx)).toEqual([]);
  });

  it('returns empty when rule is disabled', () => {
    const ctx = makeContext({
      rules: [{ id: RULE_ID, walletAddress: ADDR, type: AlertType.HealthFactor, threshold: 1.5, enabled: false }],
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.2, updatedAt: new Date() },
      ],
    });
    expect(healthFactorEvaluator(ctx)).toEqual([]);
  });

  it('triggers when healthFactor is below threshold', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.3, updatedAt: new Date() },
      ],
    });
    const events = healthFactorEvaluator(ctx);
    expect(events).toHaveLength(1);
    expect(events[0].ruleId).toBe(RULE_ID);
    expect(events[0].severity).toBe(AlertSeverity.Medium);
  });

  it('assigns High severity below 1.2', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.1, updatedAt: new Date() },
      ],
    });
    expect(healthFactorEvaluator(ctx)[0].severity).toBe(AlertSeverity.High);
  });

  it('assigns Critical severity below 1.05', () => {
    const ctx = makeContext({
      positions: [
        { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.02, updatedAt: new Date() },
      ],
    });
    expect(healthFactorEvaluator(ctx)[0].severity).toBe(AlertSeverity.Critical);
  });
});
