import { PrismaClient } from '@prisma/client';
import { AlertType, AssetBalance, ProtocolPosition } from '@defi-copilot/domain';
import { evaluateAlerts, AlertContext } from '@defi-copilot/alert-engine';

interface SnapshotRow {
  id: string;
  walletAddress: string;
  totalUsdValue: number;
  timestamp: Date;
}

export async function processAlerts(
  walletAddress: string,
  balances: AssetBalance[],
  positions: ProtocolPosition[],
  currentSnapshot: SnapshotRow,
  prisma: PrismaClient,
) {
  // Load alert rules for this wallet
  const rules = await prisma.alertRule.findMany({
    where: { walletAddress, enabled: true },
  });

  if (rules.length === 0) {
    console.log(`[alerts] ${walletAddress}: no active rules`);
    return [];
  }

  // Load previous snapshot for comparison
  const previousSnapshotRow = await prisma.portfolioSnapshot.findFirst({
    where: { walletAddress, id: { not: currentSnapshot.id } },
    orderBy: { timestamp: 'desc' },
  });

  const previousSnapshot = previousSnapshotRow
    ? { walletAddress: previousSnapshotRow.walletAddress, totalUsdValue: previousSnapshotRow.totalUsdValue, timestamp: previousSnapshotRow.timestamp }
    : undefined;

  // Load previous balances (before the current replace)
  // Since we already replaced them, we use the snapshot-based approach
  // In practice the previous balances were the ones before processSnapshot replaced them.
  // For the first run, previousBalances won't exist.
  const context: AlertContext = {
    walletAddress,
    rules: rules.map((r) => ({
      id: r.id,
      walletAddress: r.walletAddress,
      type: r.type as AlertType,
      threshold: r.threshold,
      enabled: r.enabled,
    })),
    balances,
    positions,
    currentSnapshot: {
      walletAddress: currentSnapshot.walletAddress,
      totalUsdValue: currentSnapshot.totalUsdValue,
      timestamp: currentSnapshot.timestamp,
    },
    previousSnapshot,
  };

  const events = evaluateAlerts(context);

  if (events.length > 0) {
    await prisma.alertEvent.createMany({
      data: events.map((e) => ({
        id: e.id,
        walletAddress: e.walletAddress,
        ruleId: e.ruleId,
        message: e.message,
        severity: e.severity,
      })),
    });
  }

  console.log(`[alerts] ${walletAddress}: ${events.length} events from ${rules.length} rules`);

  return events;
}
