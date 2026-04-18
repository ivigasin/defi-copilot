import { AlertType, PositionType } from '@defi-copilot/domain';
import { processAlerts } from './alerts';

const ADDR = '0x0000000000000000000000000000000000000001';

function makePrisma(overrides?: { rules?: unknown[]; previousSnapshot?: unknown }) {
  return {
    alertRule: {
      findMany: jest.fn().mockResolvedValue(overrides?.rules ?? []),
    },
    portfolioSnapshot: {
      findFirst: jest.fn().mockResolvedValue(overrides?.previousSnapshot ?? null),
    },
    alertEvent: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  } as never;
}

describe('processAlerts', () => {
  it('returns empty when no active rules exist', async () => {
    const prisma = makePrisma({ rules: [] });
    const snapshot = { id: 's1', walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() };

    const events = await processAlerts(ADDR, [], [], snapshot, prisma);
    expect(events).toEqual([]);
  });

  it('evaluates health factor rule and stores events', async () => {
    const rules = [
      { id: 'r1', walletAddress: ADDR, type: AlertType.HealthFactor, threshold: 1.5, enabled: true },
    ];
    const prisma = makePrisma({ rules });
    const snapshot = { id: 's1', walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() };
    const positions = [
      { id: 'p1', walletAddress: ADDR, chainId: 1, protocol: 'Aave', positionType: PositionType.Borrowing, assetSymbols: ['DAI'], usdValue: 2000, debtUsd: 2000, healthFactor: 1.1, updatedAt: new Date() },
    ];

    const events = await processAlerts(ADDR, [], positions, snapshot, prisma);

    expect(events).toHaveLength(1);
    expect(events[0].ruleId).toBe('r1');
    expect(prisma.alertEvent.createMany).toHaveBeenCalled();
  });

  it('evaluates portfolio drop rule with previous snapshot', async () => {
    const rules = [
      { id: 'r2', walletAddress: ADDR, type: AlertType.PortfolioDrop, threshold: 10, enabled: true },
    ];
    const previousSnapshot = { id: 's0', walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() };
    const prisma = makePrisma({ rules, previousSnapshot });
    const snapshot = { id: 's1', walletAddress: ADDR, totalUsdValue: 7000, timestamp: new Date() };

    const events = await processAlerts(ADDR, [], [], snapshot, prisma);

    expect(events).toHaveLength(1);
    expect(events[0].message).toContain('30.0%');
  });

  it('does not create events when nothing triggers', async () => {
    const rules = [
      { id: 'r1', walletAddress: ADDR, type: AlertType.HealthFactor, threshold: 1.5, enabled: true },
    ];
    const prisma = makePrisma({ rules });
    const snapshot = { id: 's1', walletAddress: ADDR, totalUsdValue: 10000, timestamp: new Date() };

    const events = await processAlerts(ADDR, [], [], snapshot, prisma);

    expect(events).toEqual([]);
    expect(prisma.alertEvent.createMany).not.toHaveBeenCalled();
  });
});
